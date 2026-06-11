package com.foodorderapplication.backend.config;

import java.util.concurrent.Executor;
import org.flywaydb.core.Flyway;
import org.springframework.boot.LazyInitializationExcludeFilter;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    @Bean(name = "emailExecutor")
    public Executor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("email-thread-");
        executor.initialize();
        return executor;
    }

    @Bean
    public static LazyInitializationExcludeFilter eagerFlyway() {
        System.out.println("EAGER_FLYWAY_EXCLUDE_FILTER_INITIALIZED");
        return LazyInitializationExcludeFilter.forBeanTypes(
            Flyway.class, 
            FlywayMigrationInitializer.class
        );
    }
}
