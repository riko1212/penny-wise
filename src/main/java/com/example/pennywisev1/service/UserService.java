package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.UserRepository;
import com.example.pennywisev1.repository.entity.UserEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<UserEntity> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public UserEntity registerUser(UserEntity userEntity) {
        if (userRepository.existsByName(userEntity.getName())) {
            throw new IllegalArgumentException("User with this name already exists");
        }

        if (userEntity.getPassword() == null || userEntity.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        return userRepository.save(userEntity);
    }
}
