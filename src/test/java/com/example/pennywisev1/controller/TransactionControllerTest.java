package com.example.pennywisev1.controller;

import com.example.pennywisev1.repository.TransactionRepository;
import com.example.pennywisev1.repository.entity.TransactionEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.ZoneId;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TransactionControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired TransactionRepository transactionRepository;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
    }

    private TransactionEntity createTransaction(Long userId, String category, String topic,
                                                 Double income, String type, LocalDate date) {
        TransactionEntity t = new TransactionEntity();
        t.setUserId(userId);
        t.setCategoryName(category);
        t.setTopic(topic);
        t.setIncome(income);
        t.setType(type);
        t.setDate(date.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli());
        return transactionRepository.save(t);
    }

    @Test
    void createTransaction_success() throws Exception {
        long dateMs = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId":1,"categoryName":"Food","topic":"Lunch",
                                 "income":50.0,"type":"EXPENSE","date":%d}
                                """.formatted(dateMs)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topic").value("Lunch"))
                .andExpect(jsonPath("$.income").value(50.0));
    }

    @Test
    void createTransaction_missingUserId_returns400() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryName\":\"Food\",\"topic\":\"Lunch\",\"income\":50.0,\"type\":\"EXPENSE\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getTransactions_returnsFilteredByMonth() throws Exception {
        long march = LocalDate.of(2026, 3, 10).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long feb   = LocalDate.of(2026, 2, 5).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

        mockMvc.perform(post("/api/transactions").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":1,\"categoryName\":\"Food\",\"topic\":\"March\",\"income\":100.0,\"type\":\"EXPENSE\",\"date\":%d}".formatted(march)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/transactions").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":1,\"categoryName\":\"Food\",\"topic\":\"Feb\",\"income\":200.0,\"type\":\"EXPENSE\",\"date\":%d}".formatted(feb)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/transactions")
                        .param("userId", "1")
                        .param("categoryName", "Food")
                        .param("type", "EXPENSE")
                        .param("month", "3")
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].topic").value("March"));
    }

    @Test
    void getTotal_sumsCorrectlyForMonth() throws Exception {
        long march = LocalDate.of(2026, 3, 1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

        createTransaction(1L, "Food",      "Lunch", 100.0, "EXPENSE", LocalDate.of(2026, 3, 1));
        createTransaction(1L, "Transport", "Bus",    50.0, "EXPENSE", LocalDate.of(2026, 3, 2));
        createTransaction(1L, "Food",      "Feb",   200.0, "EXPENSE", LocalDate.of(2026, 2, 1));

        mockMvc.perform(get("/api/transactions/total")
                        .param("userId", "1")
                        .param("type", "EXPENSE")
                        .param("month", "3")
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(150.0));
    }

    @Test
    void updateTransaction_success() throws Exception {
        TransactionEntity t = createTransaction(1L, "Food", "Lunch", 50.0, "EXPENSE", LocalDate.now());
        long newDate = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

        mockMvc.perform(put("/api/transactions/" + t.getId())
                        .param("userId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"topic\":\"Dinner\",\"income\":80.0,\"categoryName\":\"Food\",\"date\":%d}".formatted(newDate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topic").value("Dinner"))
                .andExpect(jsonPath("$.income").value(80.0));
    }

    @Test
    void deleteTransaction_success() throws Exception {
        TransactionEntity t = createTransaction(1L, "Food", "Lunch", 50.0, "EXPENSE", LocalDate.now());

        mockMvc.perform(delete("/api/transactions/" + t.getId())
                        .param("userId", "1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void clearTransactions_removesAll() throws Exception {
        createTransaction(1L, "Food", "Lunch",  50.0, "EXPENSE", LocalDate.now());
        createTransaction(1L, "Food", "Dinner", 80.0, "EXPENSE", LocalDate.now());

        mockMvc.perform(delete("/api/transactions")
                        .param("userId", "1")
                        .param("categoryName", "Food")
                        .param("type", "EXPENSE"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/transactions")
                        .param("userId", "1")
                        .param("categoryName", "Food")
                        .param("type", "EXPENSE"))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getSummary_groupsByCategory() throws Exception {
        createTransaction(1L, "Food",      "Lunch",  100.0, "EXPENSE", LocalDate.now());
        createTransaction(1L, "Food",      "Dinner",  50.0, "EXPENSE", LocalDate.now());
        createTransaction(1L, "Transport", "Bus",     30.0, "EXPENSE", LocalDate.now());

        mockMvc.perform(get("/api/transactions/summary")
                        .param("userId", "1")
                        .param("type", "EXPENSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
