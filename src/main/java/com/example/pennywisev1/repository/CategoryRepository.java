package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    List<CategoryEntity> findByUserIdAndType(Long userId, String type);
    void deleteByIdAndUserId(Long id, Long userId);
    void deleteByUserId(Long userId);
    long countByUserId(Long userId);
}
