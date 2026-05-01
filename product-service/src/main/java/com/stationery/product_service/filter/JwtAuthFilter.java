package com.stationery.product_service.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String USER_EMAIL_HEADER = "X-User-Email";
    private static final String USER_ROLE_HEADER = "X-User-Role";
    private static final String AUTH_VALIDATED_HEADER = "X-Auth-Validated";

    /** Skip JWT filter for public and Swagger paths */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        // Skip JWT filter for static/documentation and public product GET endpoints
        if (path.equals("/error")
            || path.startsWith("/swagger-ui")
            || path.startsWith("/v3/api-docs")
            || path.equals("/swagger-ui.html")
            || path.startsWith("/webjars/")) {
            return true;
        }

        // Public GET product endpoints are allowed without authentication
        if ("GET".equalsIgnoreCase(method) && (
                path.equals("/api/products") ||
                path.startsWith("/api/products/") ||
                path.startsWith("/api/products/available") ||
                path.startsWith("/api/products/search/"))) {
            return true;
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            if ("true".equalsIgnoreCase(request.getHeader(AUTH_VALIDATED_HEADER))) {
                String email = request.getHeader(USER_EMAIL_HEADER);
                String role = request.getHeader(USER_ROLE_HEADER);

                if (email != null && role != null) {
                    String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    SimpleGrantedAuthority grantedAuthority = new SimpleGrantedAuthority(authority);

                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        Collections.singletonList(grantedAuthority)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            // Gateway identity missing or malformed, continue without authentication
        }

        filterChain.doFilter(request, response);
    }
}
