package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    boolean existsByName(String name);
    Optional<UserEntity> findByName(String name);
}
