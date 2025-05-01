package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    // Можна додавати додаткові методи для пошуку транзакцій за датою, типом тощо.
}
