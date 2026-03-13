package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.TransactionRepository;
import com.example.pennywisev1.repository.entity.TransactionEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<TransactionEntity> getTransactions(Long userId, String categoryName) {
        return transactionRepository.findByUserIdAndCategoryName(userId, categoryName);
    }

    public TransactionEntity createTransaction(TransactionEntity transaction) {
        if (transaction.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }
        if (transaction.getCategoryName() == null || transaction.getCategoryName().isEmpty()) {
            throw new IllegalArgumentException("categoryName is required");
        }
        if (transaction.getTopic() == null || transaction.getTopic().isEmpty()) {
            throw new IllegalArgumentException("topic is required");
        }
        if (transaction.getIncome() == null) {
            throw new IllegalArgumentException("income is required");
        }
        return transactionRepository.save(transaction);
    }

    public TransactionEntity updateTransaction(Long id, Long userId, TransactionEntity updated) {
        TransactionEntity existing = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!existing.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        existing.setTopic(updated.getTopic());
        existing.setIncome(updated.getIncome());
        existing.setDate(updated.getDate());
        existing.setCategoryName(updated.getCategoryName());
        return transactionRepository.save(existing);
    }

    public void deleteTransaction(Long id, Long userId) {
        transactionRepository.deleteByIdAndUserId(id, userId);
    }
}
