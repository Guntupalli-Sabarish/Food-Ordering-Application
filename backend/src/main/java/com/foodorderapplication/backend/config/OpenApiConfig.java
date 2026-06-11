package com.foodorderapplication.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Food Ordering Application API")
                        .version("1.0.0")
                        .description("API for Food Ordering Application")
                        .contact(new Contact()
                                .name("Support")
                                .email("support@foodordering.com")))
                .components(new Components()
                        .addSecuritySchemes("cookieAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .name("token")
                                        .description("Secure HttpOnly cookie containing JWT authentication token"))
                        .addSecuritySchemes("csrfToken",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("X-XSRF-TOKEN")
                                        .description("CSRF validation header double-submitted with client state-changing requests")))
                .addSecurityItem(new SecurityRequirement()
                        .addList("cookieAuth")
                        .addList("csrfToken"));
    }
}
