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

    // Get transactions by user, category and type (optional month/year filter)
    @GetMapping
    public ResponseEntity<List<TransactionEntity>> getTransactions(
            @RequestParam Long userId,
            @RequestParam String categoryName,
            @RequestParam String type,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(transactionService.getTransactions(userId, categoryName, type, month, year));
    }

    // Get history grouped by month or year
    @GetMapping("/history")
    public ResponseEntity<List<java.util.Map<String, Object>>> getHistory(
            @RequestParam Long userId,
            @RequestParam String type,
            @RequestParam(defaultValue = "month") String groupBy) {
        return ResponseEntity.ok(transactionService.getHistory(userId, type, groupBy));
    }

    // Get history grouped by month/year AND category
    @GetMapping("/history/categories")
    public ResponseEntity<List<java.util.Map<String, Object>>> getCategoryHistory(
            @RequestParam Long userId,
            @RequestParam String type,
            @RequestParam(defaultValue = "month") String groupBy) {
        return ResponseEntity.ok(transactionService.getCategoryHistory(userId, type, groupBy));
    }

    // Get per-category summary by user and type
    @GetMapping("/summary")
    public ResponseEntity<List<java.util.Map<String, Object>>> getSummary(
            @RequestParam Long userId,
            @RequestParam String type) {
        return ResponseEntity.ok(transactionService.getSummaryByType(userId, type));
    }

    // Get total sum by user and type (optional month/year filter)
    @GetMapping("/total")
    public ResponseEntity<Double> getTotal(
            @RequestParam Long userId,
            @RequestParam String type,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(transactionService.getTotalByType(userId, type, month, year));
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

    // Clear all transactions for user + category + type
    @DeleteMapping
    public ResponseEntity<Void> clearTransactions(
            @RequestParam Long userId,
            @RequestParam String categoryName,
            @RequestParam String type) {
        transactionService.clearTransactions(userId, categoryName, type);
        return ResponseEntity.noContent().build();
    }
}
