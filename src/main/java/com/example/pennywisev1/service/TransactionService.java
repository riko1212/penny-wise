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

    // Створення нової транзакції
    public TransactionEntity saveTransaction(TransactionEntity transaction) {
        return transactionRepository.save(transaction);
    }

    // Отримання всіх транзакцій
    public List<TransactionEntity> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // Отримання транзакцій по id
    public TransactionEntity getTransactionById(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }
}
