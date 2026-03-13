package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.CategoryRepository;
import com.example.pennywisev1.repository.entity.CategoryEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryEntity> getCategoriesByUser(Long userId, String type) {
        return categoryRepository.findByUserIdAndType(userId, type);
    }

    public CategoryEntity saveCategory(CategoryEntity category) {
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id, Long userId) {
        categoryRepository.deleteByIdAndUserId(id, userId);
    }
}
