package com.example.pennywisev1.controller;

import com.example.pennywisev1.repository.entity.CategoryEntity;
import com.example.pennywisev1.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Отримати категорії юзера
    @GetMapping
    public ResponseEntity<List<CategoryEntity>> getCategoriesByUser(@RequestParam Long userId) {
        return ResponseEntity.ok(categoryService.getCategoriesByUser(userId));
    }

    // Створити категорію
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryEntity category) {
        if (category.getName() == null || category.getName().isEmpty()) {
            return ResponseEntity.badRequest().body("Category name is required");
        }
        if (category.getUserId() == null) {
            return ResponseEntity.badRequest().body("userId is required");
        }
        category.setId(null);
        return ResponseEntity.ok(categoryService.saveCategory(category));
    }

    // Видалити категорію
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, @RequestParam Long userId) {
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.noContent().build();
    }
}
