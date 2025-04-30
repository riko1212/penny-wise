package com.example.pennywisev1.repository;

import com.example.pennywisev1.repository.entity.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepository extends JpaRepository<TestEntity, Long> {

    @Query("SELECT t.message FROM TestEntity t WHERE t.id = :id")
    String findMessageById(@Param("id") Long id);

}
