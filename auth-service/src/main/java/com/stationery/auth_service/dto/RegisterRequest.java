package com.stationery.auth_service.dto;

import lombok.Data;
import com.stationery.auth_service.entity.Role;

@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String phoneNumber;
    private String password;

    /** Optional – defaults to ROLE_USER if not provided */
    private Role role;
}
