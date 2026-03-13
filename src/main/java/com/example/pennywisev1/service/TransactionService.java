package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.TransactionRepository;
import com.example.pennywisev1.repository.entity.TransactionEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalDate;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<TransactionEntity> getTransactions(Long userId, String categoryName, String type, Integer month, Integer year) {
        List<TransactionEntity> all = transactionRepository.findByUserIdAndCategoryNameAndType(userId, categoryName, type);
        if (month == null || year == null) return all;
        return all.stream().filter(t -> {
            if (t.getDate() == null) return false;
            LocalDate d = Instant.ofEpochMilli(t.getDate()).atZone(ZoneId.systemDefault()).toLocalDate();
            return d.getMonthValue() == month && d.getYear() == year;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getHistory(Long userId, String type, String groupBy) {
        List<TransactionEntity> transactions = transactionRepository.findByUserIdAndType(userId, type);
        Map<String, Double> grouped = new LinkedHashMap<>();
        for (TransactionEntity t : transactions) {
            if (t.getDate() == null) continue;
            LocalDate date = Instant.ofEpochMilli(t.getDate()).atZone(ZoneId.systemDefault()).toLocalDate();
            String key = "year".equals(groupBy)
                    ? String.valueOf(date.getYear())
                    : date.getYear() + "-" + String.format("%02d", date.getMonthValue());
            grouped.merge(key, t.getIncome() != null ? t.getIncome() : 0.0, Double::sum);
        }
        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("period", e.getKey());
                    entry.put("total", Math.round(e.getValue() * 100.0) / 100.0);
                    return entry;
                })
                .collect(Collectors.toList());
    }

    public List<java.util.Map<String, Object>> getSummaryByType(Long userId, String type) {
        return transactionRepository.sumByCategory(userId, type).stream()
                .map(row -> {
                    java.util.Map<String, Object> entry = new java.util.LinkedHashMap<>();
                    entry.put("categoryName", row[0]);
                    entry.put("total", row[1]);
                    return entry;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public Double getTotalByType(Long userId, String type, Integer month, Integer year) {
        return transactionRepository.findByUserIdAndType(userId, type).stream()
                .filter(t -> {
                    if (month == null || year == null) return true;
                    if (t.getDate() == null) return false;
                    LocalDate d = Instant.ofEpochMilli(t.getDate()).atZone(ZoneId.systemDefault()).toLocalDate();
                    return d.getMonthValue() == month && d.getYear() == year;
                })
                .mapToDouble(t -> t.getIncome() != null ? t.getIncome() : 0.0)
                .sum();
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
        if (!List.of("INCOME", "EXPENSE").contains(transaction.getType())) {
            throw new IllegalArgumentException("type must be INCOME or EXPENSE");
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

    @Transactional
    public void deleteTransaction(Long id, Long userId) {
        transactionRepository.deleteByIdAndUserId(id, userId);
    }

    @Transactional
    public void clearTransactions(Long userId, String categoryName, String type) {
        transactionRepository.deleteByUserIdAndCategoryNameAndType(userId, categoryName, type);
    }
}
