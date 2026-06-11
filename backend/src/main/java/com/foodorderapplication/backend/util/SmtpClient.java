package com.foodorderapplication.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.SocketFactory;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class SmtpClient {
    private static final Logger logger = LoggerFactory.getLogger(SmtpClient.class);

    private final SmtpProperties properties;

    public SmtpClient(SmtpProperties properties) {
        this.properties = properties;
    }

    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient address is required");
        }

        // Validate recipient email format with a strict parser
        if (!to.matches("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$")) {
            throw new IllegalArgumentException("Invalid recipient email format");
        }

        // Sanitize header values to reject carriage return (\r) and line feed (\n) characters
        if (to.contains("\r") || to.contains("\n") || (subject != null && (subject.contains("\r") || subject.contains("\n")))) {
            throw new IllegalArgumentException("CRLF injection detected in headers");
        }

        if (properties.getHost() == null || properties.getHost().isBlank()) {
            throw new IllegalStateException("SMTP host is not configured");
        }

        String from = properties.getFrom();
        if (from == null || from.isBlank()) {
            from = properties.getUsername();
        }
        if (from == null || from.isBlank()) {
            throw new IllegalStateException("SMTP from address is not configured");
        }

        Socket socket = null;
        BufferedReader reader = null;
        BufferedWriter writer = null;

        try {
            socket = createSocket(properties.isSsl());
            socket.connect(new InetSocketAddress(properties.getHost(), properties.getPort()), properties.getTimeoutMs());
            socket.setSoTimeout(properties.getTimeoutMs());

            reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));

            expect(readResponse(reader), 220);

            sendLine(writer, "EHLO localhost");
            expect(readResponse(reader), 250);

            if (!properties.isSsl() && properties.isStarttls()) {
                sendLine(writer, "STARTTLS");
                expect(readResponse(reader), 220);

                socket = upgradeToTls(socket, properties.getHost(), properties.getPort());
                reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));

                sendLine(writer, "EHLO localhost");
                expect(readResponse(reader), 250);
            }

            authenticate(reader, writer);

            sendLine(writer, "MAIL FROM:<" + from + ">");
            expect(readResponse(reader), 250);

            sendLine(writer, "RCPT TO:<" + to + ">");
            expect(readResponse(reader), 250);

            sendLine(writer, "DATA");
            expect(readResponse(reader), 354);

            String payload = buildMessage(from, to, subject, body);
            sendLine(writer, payload + "\r\n.");
            expect(readResponse(reader), 250);

            sendLine(writer, "QUIT");
            readResponse(reader);
        } catch (IOException ex) {
            logger.error("SMTP send failed", ex);
            throw new IllegalStateException("SMTP send failed: " + ex.getMessage(), ex);
        } finally {
            closeQuietly(reader);
            closeQuietly(writer);
            closeQuietly(socket);
        }
    }

    private Socket createSocket(boolean ssl) throws IOException {
        SocketFactory factory = ssl ? SSLSocketFactory.getDefault() : SocketFactory.getDefault();
        return factory.createSocket();
    }

    private Socket upgradeToTls(Socket socket, String host, int port) throws IOException {
        SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
        SSLSocket sslSocket = (SSLSocket) factory.createSocket(socket, host, port, true);
        sslSocket.startHandshake();
        return sslSocket;
    }

    private void authenticate(BufferedReader reader, BufferedWriter writer) throws IOException {
        if (properties.getUsername() == null || properties.getUsername().isBlank()) {
            return;
        }

        sendLine(writer, "AUTH LOGIN");
        expect(readResponse(reader), 334);

        sendLine(writer, base64(properties.getUsername()));
        expect(readResponse(reader), 334);

        sendLine(writer, base64(properties.getPassword()));
        expect(readResponse(reader), 235);
    }

    private String base64(String value) {
        if (value == null) {
            value = "";
        }
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.US_ASCII));
    }

    private String buildMessage(String from, String to, String subject, String body) {
        String safeSubject = subject == null ? "" : subject;
        String safeBody = body == null ? "" : body;

        StringBuilder builder = new StringBuilder();
        builder.append("From: ").append(from).append("\r\n");
        builder.append("To: ").append(to).append("\r\n");
        builder.append("Subject: ").append(safeSubject).append("\r\n");
        builder.append("MIME-Version: 1.0\r\n");
        builder.append("Content-Type: text/plain; charset=UTF-8\r\n");
        builder.append("\r\n");
        builder.append(safeBody);
        return builder.toString();
    }

    private void sendLine(BufferedWriter writer, String line) throws IOException {
        writer.write(line);
        if (!line.endsWith("\r\n")) {
            writer.write("\r\n");
        }
        writer.flush();
    }

    private String readResponse(BufferedReader reader) throws IOException {
        String line = reader.readLine();
        if (line == null) {
            throw new IOException("SMTP server closed the connection");
        }
        StringBuilder response = new StringBuilder(line);
        if (line.length() >= 4 && line.charAt(3) == '-') {
            String code = line.substring(0, 3);
            while (true) {
                String next = reader.readLine();
                if (next == null) {
                    throw new IOException("SMTP server closed the connection");
                }
                response.append("\n").append(next);
                if (next.startsWith(code + " ")) {
                    break;
                }
            }
        }
        logger.debug("SMTP response: {}", response);
        return response.toString();
    }

    private void expect(String response, int expectedCode) throws IOException {
        if (response.length() < 3) {
            throw new IOException("Invalid SMTP response: " + response);
        }
        int actual = Integer.parseInt(response.substring(0, 3));
        if (actual != expectedCode && actual != 250) {
            throw new IOException("Unexpected SMTP response: " + response);
        }
    }

    private void closeQuietly(AutoCloseable closeable) {
        if (closeable == null) {
            return;
        }
        try {
            closeable.close();
        } catch (Exception ex) {
            logger.debug("Failed to close resource", ex);
        }
    }
}
