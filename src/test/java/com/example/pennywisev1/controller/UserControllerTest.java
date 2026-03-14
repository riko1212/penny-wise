package com.example.pennywisev1.controller;

import com.example.pennywisev1.repository.UserRepository;
import com.example.pennywisev1.repository.entity.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    private UserEntity createUser(String name, String email, String rawPassword) {
        UserEntity u = new UserEntity();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        return userRepository.save(u);
    }

    @Test
    void register_success_returnsUserWithoutPassword() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"alice\",\"email\":\"alice@test.com\",\"password\":\"pass1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("alice"))
                .andExpect(jsonPath("$.email").value("alice@test.com"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void register_duplicateName_returns400() throws Exception {
        createUser("alice", "alice@test.com", "pass1234");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"alice\",\"email\":\"other@test.com\",\"password\":\"pass1234\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_shortPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"bob\",\"email\":\"bob@test.com\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_success_returnsUser() throws Exception {
        createUser("alice", "alice@test.com", "pass1234");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"alice\",\"password\":\"pass1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("alice"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        createUser("alice", "alice@test.com", "pass1234");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"alice\",\"password\":\"wrongpass\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getUserById_returnsUser() throws Exception {
        UserEntity user = createUser("alice", "alice@test.com", "pass1234");

        mockMvc.perform(get("/api/users/" + user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("alice"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void getUserById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/users/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateUser_success() throws Exception {
        UserEntity user = createUser("alice", "alice@test.com", "pass1234");

        mockMvc.perform(put("/api/users/" + user.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"alice2\",\"email\":\"new@test.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("alice2"))
                .andExpect(jsonPath("$.email").value("new@test.com"));
    }

    @Test
    void changePassword_success() throws Exception {
        UserEntity user = createUser("alice", "alice@test.com", "pass1234");

        mockMvc.perform(put("/api/users/" + user.getId() + "/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"pass1234\",\"newPassword\":\"newpass99\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void changePassword_wrongCurrent_returns400() throws Exception {
        UserEntity user = createUser("alice", "alice@test.com", "pass1234");

        mockMvc.perform(put("/api/users/" + user.getId() + "/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"wrongpass\",\"newPassword\":\"newpass99\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteUser_success() throws Exception {
        UserEntity user = createUser("alice", "alice@test.com", "pass1234");

        mockMvc.perform(delete("/api/users/" + user.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/users/" + user.getId()))
                .andExpect(status().isNotFound());
    }
}
