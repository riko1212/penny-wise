package com.example.pennywisev1.controller;

import com.example.pennywisev1.repository.CategoryRepository;
import com.example.pennywisev1.repository.entity.CategoryEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CategoryControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired CategoryRepository categoryRepository;

    @BeforeEach
    void setUp() {
        categoryRepository.deleteAll();
    }

    private CategoryEntity createCategory(String name, Long userId, String type) {
        CategoryEntity c = new CategoryEntity();
        c.setName(name);
        c.setUserId(userId);
        c.setType(type);
        return categoryRepository.save(c);
    }

    @Test
    void getCategories_returnsOnlyMatchingUserAndType() throws Exception {
        createCategory("Food",      1L, "EXPENSE");
        createCategory("Transport", 1L, "EXPENSE");
        createCategory("Salary",    1L, "INCOME");
        createCategory("Food",      2L, "EXPENSE");

        mockMvc.perform(get("/api/categories")
                        .param("userId", "1")
                        .param("type", "EXPENSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Food"))
                .andExpect(jsonPath("$[1].name").value("Transport"));
    }

    @Test
    void createCategory_success() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Food\",\"userId\":1,\"type\":\"EXPENSE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Food"))
                .andExpect(jsonPath("$.type").value("EXPENSE"));
    }

    @Test
    void createCategory_missingName_returns400() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"userId\":1,\"type\":\"EXPENSE\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCategory_invalidType_returns400() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Food\",\"userId\":1,\"type\":\"INVALID\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteCategory_success() throws Exception {
        CategoryEntity cat = createCategory("Food", 1L, "EXPENSE");

        mockMvc.perform(delete("/api/categories/" + cat.getId())
                        .param("userId", "1"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/categories")
                        .param("userId", "1")
                        .param("type", "EXPENSE"))
                .andExpect(jsonPath("$.length()").value(0));
    }
}
