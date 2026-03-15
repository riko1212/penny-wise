package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.GoalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface GoalRepository extends JpaRepository<GoalEntity, Long> {
    List<GoalEntity> findByUserId(Long userId);

    @Transactional
    void deleteByIdAndUserId(Long id, Long userId);
}
