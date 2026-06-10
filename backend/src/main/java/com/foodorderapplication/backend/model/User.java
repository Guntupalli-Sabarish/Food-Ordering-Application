package com.foodorderapplication.backend.model;

import com.foodorderapplication.backend.model.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Long userId;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserRole role;

	@Column(name = "email_verified", nullable = false)
	private boolean emailVerified;

	@Column(name = "verification_token")
	private String verificationToken;

	@Column(name = "verification_token_expires_at")
	private LocalDateTime verificationTokenExpiresAt;

	@Column(name = "reset_token")
	private String resetToken;

	@Column(name = "reset_token_expires_at")
	private LocalDateTime resetTokenExpiresAt;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "token_version", nullable = false)
	private Integer tokenVersion = 0;

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
		if (role == null) {
			role = UserRole.CUSTOMER;
		}
		if (!emailVerified) {
			emailVerified = false;
		}
		if (tokenVersion == null) {
			tokenVersion = 0;
		}
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}

	public boolean isEmailVerified() {
		return emailVerified;
	}

	public void setEmailVerified(boolean emailVerified) {
		this.emailVerified = emailVerified;
	}

	public String getVerificationToken() {
		return verificationToken;
	}

	public void setVerificationToken(String verificationToken) {
		this.verificationToken = verificationToken;
	}

	public LocalDateTime getVerificationTokenExpiresAt() {
		return verificationTokenExpiresAt;
	}

	public void setVerificationTokenExpiresAt(LocalDateTime verificationTokenExpiresAt) {
		this.verificationTokenExpiresAt = verificationTokenExpiresAt;
	}

	public String getResetToken() {
		return resetToken;
	}

	public void setResetToken(String resetToken) {
		this.resetToken = resetToken;
	}

	public LocalDateTime getResetTokenExpiresAt() {
		return resetTokenExpiresAt;
	}

	public void setResetTokenExpiresAt(LocalDateTime resetTokenExpiresAt) {
		this.resetTokenExpiresAt = resetTokenExpiresAt;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Integer getTokenVersion() {
		return tokenVersion;
	}

	public void setTokenVersion(Integer tokenVersion) {
		this.tokenVersion = tokenVersion;
	}

}
