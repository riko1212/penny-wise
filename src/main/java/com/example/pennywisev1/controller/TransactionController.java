package com.example.pennywisev1.controller;

import com.example.pennywisev1.repository.entity.TransactionEntity;
import com.example.pennywisev1.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Отримання всіх транзакцій
    @GetMapping
    public List<TransactionEntity> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    // Створення нової транзакції
    @PostMapping
    public ResponseEntity<TransactionEntity> createTransaction(@RequestBody TransactionEntity transaction) {
        if (transaction.getType() == null || transaction.getType().isEmpty()) {
            return ResponseEntity.badRequest().build(); // Помилка, якщо тип порожній
        }
        return ResponseEntity.ok(transactionService.saveTransaction(transaction));
    }

    // Отримання транзакції по id
    @GetMapping("/{id}")
    public ResponseEntity<TransactionEntity> getTransactionById(@PathVariable Long id) {
        TransactionEntity transaction = transactionService.getTransactionById(id);
        if (transaction == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(transaction);
    }
}
