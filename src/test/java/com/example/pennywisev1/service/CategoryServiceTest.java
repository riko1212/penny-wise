package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.CategoryRepository;
import com.example.pennywisev1.repository.entity.CategoryEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;

    CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryService(categoryRepository);
    }

    private CategoryEntity category(Long id, String name, Long userId, String type) {
        CategoryEntity c = new CategoryEntity();
        c.setId(id);
        c.setName(name);
        c.setUserId(userId);
        c.setType(type);
        return c;
    }

    @Test
    void getCategoriesByUser_delegatesToRepository() {
        List<CategoryEntity> expected = List.of(
                category(1L, "Food", 10L, "EXPENSE"),
                category(2L, "Transport", 10L, "EXPENSE")
        );
        when(categoryRepository.findByUserIdAndType(10L, "EXPENSE")).thenReturn(expected);

        List<CategoryEntity> result = categoryService.getCategoriesByUser(10L, "EXPENSE");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(CategoryEntity::getName)
                .containsExactly("Food", "Transport");
    }

    @Test
    void getCategoriesByUser_differentType_returnsOnlyMatching() {
        when(categoryRepository.findByUserIdAndType(10L, "INCOME")).thenReturn(
                List.of(category(3L, "Salary", 10L, "INCOME"))
        );

        List<CategoryEntity> result = categoryService.getCategoriesByUser(10L, "INCOME");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo("INCOME");
    }

    @Test
    void saveCategory_returnsSavedEntity() {
        CategoryEntity input = category(null, "Food", 10L, "EXPENSE");
        CategoryEntity saved = category(1L, "Food", 10L, "EXPENSE");

        when(categoryRepository.save(input)).thenReturn(saved);

        CategoryEntity result = categoryService.saveCategory(input);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Food");
    }

    @Test
    void deleteCategory_callsRepositoryWithCorrectArgs() {
        categoryService.deleteCategory(5L, 10L);

        verify(categoryRepository).deleteByIdAndUserId(5L, 10L);
    }
}
