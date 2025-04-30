package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    boolean existsByName(String name);
}
