package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.NotificationJob;
import com.foodorderapplication.backend.model.enums.NotificationJobStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationJobRepository extends JpaRepository<NotificationJob, Long> {
    List<NotificationJob> findByStatusInAndAttemptsLessThan(Collection<NotificationJobStatus> statuses, int maxAttempts);
}
