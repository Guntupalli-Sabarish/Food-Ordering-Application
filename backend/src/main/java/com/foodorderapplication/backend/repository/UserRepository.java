package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.model.enums.UserRole;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);

	Optional<User> findByVerificationToken(String verificationToken);

	boolean existsByEmail(String email);

	long countByRole(UserRole role);

	long countByRoleAndEmailVerifiedTrue(UserRole role);
}
