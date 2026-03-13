package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByUserIdAndCategoryName(Long userId, String categoryName);
    void deleteByIdAndUserId(Long id, Long userId);
    void deleteByUserIdAndCategoryName(Long userId, String categoryName);
}
