package com.example.pennywisev1.controller;

import com.example.pennywisev1.repository.entity.GoalEntity;
import com.example.pennywisev1.service.GoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getGoals(@RequestParam Long userId) {
        return ResponseEntity.ok(goalService.getGoals(userId));
    }

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestBody GoalEntity goal) {
        try {
            return ResponseEntity.ok(goalService.createGoal(goal));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody GoalEntity updated) {
        try {
            return ResponseEntity.ok(goalService.updateGoal(id, userId, updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id, @RequestParam Long userId) {
        goalService.deleteGoal(id, userId);
        return ResponseEntity.noContent().build();
    }
}
