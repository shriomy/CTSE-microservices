package com.stationery.auth_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.stationery.auth_service.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
