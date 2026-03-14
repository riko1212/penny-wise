package com.example.pennywisev1.service;

import com.example.pennywisev1.dto.UserResponseDTO;
import com.example.pennywisev1.repository.CategoryRepository;
import com.example.pennywisev1.repository.TransactionRepository;
import com.example.pennywisev1.repository.UserRepository;
import com.example.pennywisev1.repository.entity.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock BCryptPasswordEncoder passwordEncoder;
    @Mock TransactionRepository transactionRepository;
    @Mock CategoryRepository categoryRepository;

    UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, transactionRepository, categoryRepository);
    }

    private UserEntity entity(Long id, String name, String email, String password) {
        UserEntity u = new UserEntity();
        u.setId(id);
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        return u;
    }

    // ── registerUser ──────────────────────────────────────

    @Test
    void registerUser_success() {
        UserEntity input = entity(null, "alice", "alice@test.com", "pass1234");
        UserEntity saved = entity(1L, "alice", "alice@test.com", "$2a$encoded");

        when(userRepository.existsByName("alice")).thenReturn(false);
        when(passwordEncoder.encode("pass1234")).thenReturn("$2a$encoded");
        when(userRepository.save(any())).thenReturn(saved);

        UserResponseDTO result = userService.registerUser(input);

        assertThat(result.getName()).isEqualTo("alice");
        assertThat(result.getEmail()).isEqualTo("alice@test.com");
        assertThat(result.getId()).isEqualTo(1L);
        verify(passwordEncoder).encode("pass1234");
    }

    @Test
    void registerUser_duplicateName_throws() {
        UserEntity input = entity(null, "alice", "alice@test.com", "pass1234");
        when(userRepository.existsByName("alice")).thenReturn(true);

        assertThatThrownBy(() -> userService.registerUser(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void registerUser_shortPassword_throws() {
        UserEntity input = entity(null, "bob", "bob@test.com", "short");
        when(userRepository.existsByName("bob")).thenReturn(false);

        assertThatThrownBy(() -> userService.registerUser(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("8 characters");
    }

    @Test
    void registerUser_nullPassword_throws() {
        UserEntity input = entity(null, "bob", "bob@test.com", null);
        when(userRepository.existsByName("bob")).thenReturn(false);

        assertThatThrownBy(() -> userService.registerUser(input))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── loginUser ─────────────────────────────────────────

    @Test
    void loginUser_success() {
        UserEntity stored = entity(1L, "alice", "alice@test.com", "$2a$encoded");
        when(userRepository.findByName("alice")).thenReturn(Optional.of(stored));
        when(passwordEncoder.matches("pass1234", "$2a$encoded")).thenReturn(true);

        UserResponseDTO result = userService.loginUser("alice", "pass1234");

        assertThat(result.getName()).isEqualTo("alice");
    }

    @Test
    void loginUser_wrongPassword_throws() {
        UserEntity stored = entity(1L, "alice", "alice@test.com", "$2a$encoded");
        when(userRepository.findByName("alice")).thenReturn(Optional.of(stored));
        when(passwordEncoder.matches("wrong", "$2a$encoded")).thenReturn(false);

        assertThatThrownBy(() -> userService.loginUser("alice", "wrong"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void loginUser_userNotFound_throws() {
        when(userRepository.findByName("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.loginUser("nobody", "pass1234"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── updateUser ────────────────────────────────────────

    @Test
    void updateUser_changeNameAndEmail_success() {
        UserEntity existing = entity(1L, "alice", "old@test.com", "$2a$encoded");
        UserEntity saved = entity(1L, "alice2", "new@test.com", "$2a$encoded");

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.existsByName("alice2")).thenReturn(false);
        when(userRepository.save(any())).thenReturn(saved);

        UserResponseDTO result = userService.updateUser(1L, "alice2", "new@test.com");

        assertThat(result.getName()).isEqualTo("alice2");
        assertThat(result.getEmail()).isEqualTo("new@test.com");
    }

    @Test
    void updateUser_sameName_noConflictCheck() {
        UserEntity existing = entity(1L, "alice", "alice@test.com", "$2a$encoded");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any())).thenReturn(existing);

        userService.updateUser(1L, "alice", "new@test.com");

        verify(userRepository, never()).existsByName(any());
    }

    @Test
    void updateUser_nameTaken_throws() {
        UserEntity existing = entity(1L, "alice", "alice@test.com", "$2a$encoded");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.existsByName("bob")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateUser(1L, "bob", "alice@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    void updateUser_notFound_throws() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(99L, "x", "x@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    // ── changePassword ────────────────────────────────────

    @Test
    void changePassword_success() {
        UserEntity existing = entity(1L, "alice", "alice@test.com", "$2a$old");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("oldpass", "$2a$old")).thenReturn(true);
        when(passwordEncoder.encode("newpass12")).thenReturn("$2a$new");

        userService.changePassword(1L, "oldpass", "newpass12");

        verify(userRepository).save(argThat(u -> u.getPassword().equals("$2a$new")));
    }

    @Test
    void changePassword_wrongCurrent_throws() {
        UserEntity existing = entity(1L, "alice", "alice@test.com", "$2a$old");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("wrong", "$2a$old")).thenReturn(false);

        assertThatThrownBy(() -> userService.changePassword(1L, "wrong", "newpass12"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("incorrect");
    }

    @Test
    void changePassword_shortNew_throws() {
        UserEntity existing = entity(1L, "alice", "alice@test.com", "$2a$old");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("oldpass", "$2a$old")).thenReturn(true);

        assertThatThrownBy(() -> userService.changePassword(1L, "oldpass", "short"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("8 characters");
    }

    // ── deleteUser ────────────────────────────────────────

    @Test
    void deleteUser_success() {
        when(userRepository.existsById(1L)).thenReturn(true);

        userService.deleteUser(1L);

        verify(transactionRepository).deleteByUserId(1L);
        verify(categoryRepository).deleteByUserId(1L);
        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_notFound_throws() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    // ── getAllUsers ───────────────────────────────────────

    @Test
    void getAllUsers_returnsDTOsWithoutPassword() {
        when(userRepository.findAll()).thenReturn(List.of(
                entity(1L, "alice", "alice@test.com", "$2a$hash"),
                entity(2L, "bob", "bob@test.com", "$2a$hash2")
        ));

        List<UserResponseDTO> result = userService.getAllUsers();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserResponseDTO::getName)
                .containsExactly("alice", "bob");
    }
}
