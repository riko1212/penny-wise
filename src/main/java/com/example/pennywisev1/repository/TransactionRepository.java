package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByUserIdAndCategoryNameAndType(Long userId, String categoryName, String type);
    List<TransactionEntity> findByUserIdAndType(Long userId, String type);

    @org.springframework.data.jpa.repository.Query(
        "SELECT t.categoryName, SUM(t.income) FROM TransactionEntity t " +
        "WHERE t.userId = :userId AND t.type = :type GROUP BY t.categoryName"
    )
    List<Object[]> sumByCategory(@org.springframework.data.repository.query.Param("userId") Long userId,
                                  @org.springframework.data.repository.query.Param("type") String type);
    void deleteByIdAndUserId(Long id, Long userId);
    void deleteByUserIdAndCategoryNameAndType(Long userId, String categoryName, String type);
}
