package com.example.pennywisev1.service;

import com.example.pennywisev1.dto.UserResponseDTO;
import com.example.pennywisev1.repository.CategoryRepository;
import com.example.pennywisev1.repository.TransactionRepository;
import com.example.pennywisev1.repository.UserRepository;
import com.example.pennywisev1.repository.entity.UserEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder,
                       TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
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

    public UserResponseDTO updateUser(Long id, String name, String email) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (name != null && !name.isBlank() && !name.equals(user.getName())) {
            if (userRepository.existsByName(name)) {
                throw new IllegalArgumentException("This name is already taken");
            }
            user.setName(name);
        }

        if (email != null && !email.isBlank()) {
            user.setEmail(email);
        }

        return toDTO(userRepository.save(user));
    }

    public void changePassword(Long id, String currentPassword, String newPassword) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        transactionRepository.deleteByUserId(id);
        categoryRepository.deleteByUserId(id);
        userRepository.deleteById(id);
    }
}
