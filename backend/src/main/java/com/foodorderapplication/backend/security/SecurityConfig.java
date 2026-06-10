package com.foodorderapplication.backend.security;

import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.repository.UserRepository;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;

import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Value("${app.frontend.allowed-origins:http://localhost:5173,http://localhost:5174}")
        private String allowedOriginsRaw;
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter, OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler)
                        throws Exception {
                http.csrf(csrf -> csrf.disable())
                                .cors(Customizer.withDefaults())
                                .sessionManagement(
                                                session -> session
                                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(
                                                auth -> auth.requestMatchers(
                                                                "/api/auth/register",
                                                                "/api/auth/login",
                                                                "/api/auth/forgot-password",
                                                                "/api/auth/reset-password",
                                                                "/api/auth/verify-email",
                                                                "/api/health",
                                                                "/api/config",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/swagger-resources/**",
                                                                "/webjars/**",
                                                                "/oauth2/**",
                                                                "/login/oauth2/**")
                                                                .permitAll()
                                                                .requestMatchers("/api/customer/**").hasRole("CUSTOMER")
                                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                                .requestMatchers("/api/superadmin/**").hasRole("SUPER_ADMIN")
                                                                .anyRequest()
                                                                .authenticated())
                                .oauth2Login(oauth -> oauth
                                                .successHandler(oAuth2SuccessHandler))
                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                List<String> origins = List.of(allowedOriginsRaw.split(","));
                config.setAllowedOrigins(origins);
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public UserDetailsService userDetailsService(UserRepository userRepository) {
                return username -> {
                        User user = userRepository
                                        .findByEmail(username)
                                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                        return new org.springframework.security.core.userdetails.User(
                                        user.getEmail(), user.getPassword(), List.of(authority));
                };
        }
}
