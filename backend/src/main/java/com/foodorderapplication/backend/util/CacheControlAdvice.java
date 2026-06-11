package com.foodorderapplication.backend.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// Removed deprecated HandlerInterceptorAdapter import
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.core.MethodParameter;
import java.util.concurrent.TimeUnit;

/**
 * Advice that adds a Cache‑Control header to GET responses for static resources such as menu data.
 * This is a lightweight way to enable client‑side caching without a full CDN setup.
 */
@Order(0)
@ControllerAdvice
public class CacheControlAdvice implements ResponseBodyAdvice<Object>, WebMvcConfigurer {

    private static final String[] CACHEABLE_PATH_PREFIXES = {
        "/api/customer/menu",
        "/api/customer/restaurants"
    };

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(jakarta.servlet.http.HttpServletRequest request,
                                   jakarta.servlet.http.HttpServletResponse response,
                                   Object handler) throws Exception {
                if ("GET".equalsIgnoreCase(request.getMethod())) {
                    String uri = request.getRequestURI();
                    for (String prefix : CACHEABLE_PATH_PREFIXES) {
                        if (uri.startsWith(prefix)) {
                            // Cache for 60 seconds publicly
                            response.setHeader("Cache-Control", CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic().getHeaderValue());
                            break;
                        }
                    }
                }
                return true;
            }
        });
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Apply to all responses – the interceptor above limits it to the desired path
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, org.springframework.http.MediaType selectedContentType,
                                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                 org.springframework.http.server.ServerHttpRequest request,
                                 ServerHttpResponse response) {
        if (request instanceof ServletServerHttpResponse) {
            // No‑op – we already set the header in the interceptor
        }
        return body;
    }
}
