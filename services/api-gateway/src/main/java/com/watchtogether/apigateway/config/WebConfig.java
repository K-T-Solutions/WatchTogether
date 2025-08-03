package com.watchtogether.apigateway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Применяем ко всем путям
                // ЗАМЕНЯЕМ .allowedOrigins() НА .allowedOriginPatterns()
                .allowedOriginPatterns("*")  // ЭТО ПРАВИЛЬНЫЙ СПОСОБ ДЛЯ РАЗРАБОТКИ
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true) // Теперь это будет работать
                .maxAge(3600);
    }
}