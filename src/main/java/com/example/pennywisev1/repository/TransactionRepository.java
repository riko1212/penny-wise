package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByUserIdAndCategoryNameAndType(Long userId, String categoryName, String type);
    void deleteByIdAndUserId(Long id, Long userId);
    void deleteByUserIdAndCategoryNameAndType(Long userId, String categoryName, String type);
}
