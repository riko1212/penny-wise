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

    // Get transactions by user and category
    @GetMapping
    public ResponseEntity<List<TransactionEntity>> getTransactions(
            @RequestParam Long userId,
            @RequestParam String categoryName) {
        return ResponseEntity.ok(transactionService.getTransactions(userId, categoryName));
    }

    // Create transaction
    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody TransactionEntity transaction) {
        try {
            return ResponseEntity.ok(transactionService.createTransaction(transaction));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update transaction
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody TransactionEntity updated) {
        try {
            return ResponseEntity.ok(transactionService.updateTransaction(id, userId, updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id, @RequestParam Long userId) {
        transactionService.deleteTransaction(id, userId);
        return ResponseEntity.noContent().build();
    }

    // Clear all transactions for user + category
    @DeleteMapping
    public ResponseEntity<Void> clearTransactions(@RequestParam Long userId, @RequestParam String categoryName) {
        transactionService.clearTransactions(userId, categoryName);
        return ResponseEntity.noContent().build();
    }
}
