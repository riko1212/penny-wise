package com.example.pennywisev1.service;

import com.example.pennywisev1.dto.UserResponseDTO;
import com.example.pennywisev1.repository.UserRepository;
import com.example.pennywisev1.repository.entity.UserEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private UserResponseDTO toDTO(UserEntity user) {
        return new UserResponseDTO(user.getId(), user.getName(), user.getEmail());
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<UserResponseDTO> getUserById(Long id) {
        return userRepository.findById(id).map(this::toDTO);
    }

    public UserResponseDTO registerUser(UserEntity userEntity) {
        if (userRepository.existsByName(userEntity.getName())) {
            throw new IllegalArgumentException("User with this name already exists");
        }

        if (userEntity.getPassword() == null || userEntity.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        userEntity.setPassword(passwordEncoder.encode(userEntity.getPassword()));
        return toDTO(userRepository.save(userEntity));
    }

    public UserResponseDTO loginUser(String name, String password) {
        UserEntity user = userRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return toDTO(user);
    }

    public void resetPassword(String name, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        UserEntity user = userRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
