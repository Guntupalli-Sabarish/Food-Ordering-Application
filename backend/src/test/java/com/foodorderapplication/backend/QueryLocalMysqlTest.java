package com.foodorderapplication.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import org.junit.jupiter.api.Test;

public class QueryLocalMysqlTest {

    @Test
    public void queryDatabase() {
        String url = "jdbc:mysql://localhost:3307/fooddb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String password = "root";

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();

            System.out.println("====== LOCAL MYSQL USERS ======");
            ResultSet rsUsers = stmt.executeQuery("SELECT user_id, email, name, role, email_verified FROM users");
            while (rsUsers.next()) {
                System.out.printf("ID: %d | Email: %s | Name: %s | Role: %s | Verified: %b\n",
                    rsUsers.getLong("user_id"),
                    rsUsers.getString("email"),
                    rsUsers.getString("name"),
                    rsUsers.getString("role"),
                    rsUsers.getBoolean("email_verified")
                );
            }
            rsUsers.close();

            System.out.println("====== LOCAL MYSQL RESTAURANTS ======");
            ResultSet rsRest = stmt.executeQuery("SELECT restaurant_id, name, address, cuisine, active, admin_id FROM restaurants");
            int count = 0;
            while (rsRest.next()) {
                count++;
                System.out.printf("ID: %d | Name: %s | Address: %s | Cuisine: %s | Active: %b | Admin ID: %d\n",
                    rsRest.getLong("restaurant_id"),
                    rsRest.getString("name"),
                    rsRest.getString("address"),
                    rsRest.getString("cuisine"),
                    rsRest.getBoolean("active"),
                    rsRest.getLong("admin_id")
                );
            }
            rsRest.close();
            System.out.println("Total local restaurants found: " + count);

            stmt.close();
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
