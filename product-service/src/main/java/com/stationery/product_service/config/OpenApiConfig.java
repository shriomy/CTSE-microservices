package com.stationery.product_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI productServiceAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Product Service API")
                .description("Stationery Store - Product Management Microservice")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Stationery Team")
                    .email("support@stationery.com")
                    .url("https://stationery.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}
