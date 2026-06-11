-- Create notification_jobs table for outbox notifications
CREATE TABLE notification_jobs (
    job_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    last_attempt_at DATETIME,
    created_at DATETIME NOT NULL
);

CREATE INDEX idx_notification_jobs_status ON notification_jobs (status);
