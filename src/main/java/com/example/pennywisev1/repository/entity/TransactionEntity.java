package com.example.pennywisev1.repository.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "transaction_table")
public class TransactionEntity {

    public TransactionEntity() {}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String categoryName;

    private String topic;

    private Double income;

    private Long date;

    @Column(nullable = false, length = 10)
    private String type = "EXPENSE";

    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public Double getIncome() { return income; }
    public void setIncome(Double income) { this.income = income; }

    public Long getDate() { return date; }
    public void setDate(Long date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
