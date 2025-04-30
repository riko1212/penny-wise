package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.CategoryRepository;
import com.example.pennywisev1.repository.entity.CategoryEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryEntity> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<CategoryEntity> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // ➕ Створити категорію
    public CategoryEntity saveCategory(CategoryEntity category) {
        return categoryRepository.save(category);
    }

    // ❌ Видалити категорію
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
