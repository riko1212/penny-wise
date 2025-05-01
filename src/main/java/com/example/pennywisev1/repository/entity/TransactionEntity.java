package com.example.pennywisev1.repository.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "transaction_entity")
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;  // тип (стрінга)

    private float amount;  // сума (число флоат)

    private LocalDate date;  // дата (поточна дата)

    public TransactionEntity() {
        this.date = LocalDate.now(); // встановлюємо поточну дату при створенні об'єкта
    }

    public TransactionEntity(String type, float amount) {
        this.type = type;
        this.amount = amount;
        this.date = LocalDate.now();
    }

    // Геттери та сеттери
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public float getAmount() {
        return amount;
    }

    public void setAmount(float amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
