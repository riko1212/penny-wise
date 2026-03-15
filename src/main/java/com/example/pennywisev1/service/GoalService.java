package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.GoalRepository;
import com.example.pennywisev1.repository.TransactionRepository;
import com.example.pennywisev1.repository.entity.GoalEntity;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final TransactionRepository transactionRepository;

    public GoalService(GoalRepository goalRepository, TransactionRepository transactionRepository) {
        this.goalRepository = goalRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Map<String, Object>> getGoals(Long userId) {
        return goalRepository.findByUserId(userId).stream().map(goal -> {
            double currentAmount = transactionRepository
                    .findByUserIdAndType(userId, "INCOME")
                    .stream()
                    .filter(t -> goal.getCategoryName().equals(t.getCategoryName()))
                    .mapToDouble(t -> t.getIncome() != null ? t.getIncome() : 0.0)
                    .sum();
            currentAmount = Math.round(currentAmount * 100.0) / 100.0;

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", goal.getId());
            entry.put("userId", goal.getUserId());
            entry.put("name", goal.getName());
            entry.put("targetAmount", goal.getTargetAmount());
            entry.put("categoryName", goal.getCategoryName());
            entry.put("note", goal.getNote());
            entry.put("dueDate", goal.getDueDate());
            entry.put("currentAmount", currentAmount);
            return entry;
        }).collect(Collectors.toList());
    }

    public GoalEntity createGoal(GoalEntity goal) {
        if (goal.getUserId() == null) throw new IllegalArgumentException("userId is required");
        if (goal.getName() == null || goal.getName().isBlank()) throw new IllegalArgumentException("name is required");
        if (goal.getTargetAmount() == null || goal.getTargetAmount() <= 0) throw new IllegalArgumentException("targetAmount must be greater than 0");
        if (goal.getCategoryName() == null || goal.getCategoryName().isBlank()) throw new IllegalArgumentException("categoryName is required");
        goal.setId(null);
        return goalRepository.save(goal);
    }

    public GoalEntity updateGoal(Long id, Long userId, GoalEntity updated) {
        GoalEntity existing = goalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        if (!existing.getUserId().equals(userId)) throw new IllegalArgumentException("Access denied");

        existing.setName(updated.getName());
        existing.setTargetAmount(updated.getTargetAmount());
        existing.setCategoryName(updated.getCategoryName());
        existing.setNote(updated.getNote());
        existing.setDueDate(updated.getDueDate());
        return goalRepository.save(existing);
    }

    public void deleteGoal(Long id, Long userId) {
        goalRepository.deleteByIdAndUserId(id, userId);
    }
}
