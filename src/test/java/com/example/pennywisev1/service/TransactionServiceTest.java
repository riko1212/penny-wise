package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.TransactionRepository;
import com.example.pennywisev1.repository.entity.TransactionEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock TransactionRepository transactionRepository;

    TransactionService transactionService;

    @BeforeEach
    void setUp() {
        transactionService = new TransactionService(transactionRepository);
    }

    private TransactionEntity tx(Long id, Long userId, String category, String topic,
                                  Double income, String type, LocalDate date) {
        TransactionEntity t = new TransactionEntity();
        t.setId(id);
        t.setUserId(userId);
        t.setCategoryName(category);
        t.setTopic(topic);
        t.setIncome(income);
        t.setType(type);
        t.setDate(date.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli());
        return t;
    }

    // ── createTransaction ─────────────────────────────────

    @Test
    void createTransaction_success() {
        TransactionEntity input = tx(null, 1L, "Food", "Lunch", 50.0, "EXPENSE", LocalDate.now());
        TransactionEntity saved = tx(10L, 1L, "Food", "Lunch", 50.0, "EXPENSE", LocalDate.now());

        when(transactionRepository.save(input)).thenReturn(saved);

        TransactionEntity result = transactionService.createTransaction(input);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getTopic()).isEqualTo("Lunch");
    }

    @Test
    void createTransaction_nullUserId_throws() {
        TransactionEntity input = tx(null, null, "Food", "Lunch", 50.0, "EXPENSE", LocalDate.now());

        assertThatThrownBy(() -> transactionService.createTransaction(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("userId");
    }

    @Test
    void createTransaction_emptyCategoryName_throws() {
        TransactionEntity input = tx(null, 1L, "", "Lunch", 50.0, "EXPENSE", LocalDate.now());

        assertThatThrownBy(() -> transactionService.createTransaction(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("categoryName");
    }

    @Test
    void createTransaction_invalidType_throws() {
        TransactionEntity input = tx(null, 1L, "Food", "Lunch", 50.0, "INVALID", LocalDate.now());

        assertThatThrownBy(() -> transactionService.createTransaction(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("type");
    }

    @Test
    void createTransaction_nullIncome_throws() {
        TransactionEntity input = new TransactionEntity();
        input.setUserId(1L);
        input.setCategoryName("Food");
        input.setTopic("Lunch");
        input.setType("EXPENSE");

        assertThatThrownBy(() -> transactionService.createTransaction(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("income");
    }

    // ── getTransactions with month/year filter ────────────

    @Test
    void getTransactions_withMonthFilter_returnsOnlyMatchingMonth() {
        LocalDate march = LocalDate.of(2026, 3, 10);
        LocalDate feb   = LocalDate.of(2026, 2, 5);

        TransactionEntity marchTx = tx(1L, 1L, "Food", "Lunch",   50.0, "EXPENSE", march);
        TransactionEntity febTx   = tx(2L, 1L, "Food", "Dinner", 100.0, "EXPENSE", feb);

        when(transactionRepository.findByUserIdAndCategoryNameAndType(1L, "Food", "EXPENSE"))
                .thenReturn(List.of(marchTx, febTx));

        List<TransactionEntity> result = transactionService.getTransactions(1L, "Food", "EXPENSE", 3, 2026);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTopic()).isEqualTo("Lunch");
    }

    @Test
    void getTransactions_noFilter_returnsAll() {
        TransactionEntity t1 = tx(1L, 1L, "Food", "Lunch",  50.0, "EXPENSE", LocalDate.of(2026, 1, 1));
        TransactionEntity t2 = tx(2L, 1L, "Food", "Dinner", 80.0, "EXPENSE", LocalDate.of(2025, 12, 1));

        when(transactionRepository.findByUserIdAndCategoryNameAndType(1L, "Food", "EXPENSE"))
                .thenReturn(List.of(t1, t2));

        List<TransactionEntity> result = transactionService.getTransactions(1L, "Food", "EXPENSE", null, null);

        assertThat(result).hasSize(2);
    }

    // ── getTotalByType ────────────────────────────────────

    @Test
    void getTotalByType_withMonthFilter_sumsCorrectly() {
        LocalDate march = LocalDate.of(2026, 3, 1);
        LocalDate feb   = LocalDate.of(2026, 2, 1);

        when(transactionRepository.findByUserIdAndType(1L, "EXPENSE")).thenReturn(List.of(
                tx(1L, 1L, "Food",      "Lunch",  100.0, "EXPENSE", march),
                tx(2L, 1L, "Transport", "Bus",     50.0, "EXPENSE", march),
                tx(3L, 1L, "Food",      "Dinner", 200.0, "EXPENSE", feb)
        ));

        Double total = transactionService.getTotalByType(1L, "EXPENSE", 3, 2026);

        assertThat(total).isEqualTo(150.0);
    }

    // ── updateTransaction ─────────────────────────────────

    @Test
    void updateTransaction_success() {
        TransactionEntity existing = tx(1L, 1L, "Food", "Lunch", 50.0, "EXPENSE", LocalDate.now());
        TransactionEntity updated  = tx(1L, 1L, "Food", "Dinner", 80.0, "EXPENSE", LocalDate.now());

        when(transactionRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(transactionRepository.save(any())).thenReturn(updated);

        TransactionEntity result = transactionService.updateTransaction(1L, 1L, updated);

        assertThat(result.getTopic()).isEqualTo("Dinner");
        assertThat(result.getIncome()).isEqualTo(80.0);
    }

    @Test
    void updateTransaction_wrongUser_throws() {
        TransactionEntity existing = tx(1L, 1L, "Food", "Lunch", 50.0, "EXPENSE", LocalDate.now());
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> transactionService.updateTransaction(1L, 999L, existing))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    void updateTransaction_notFound_throws() {
        when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.updateTransaction(99L, 1L, new TransactionEntity()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    // ── delete & clear ────────────────────────────────────

    @Test
    void deleteTransaction_callsRepository() {
        transactionService.deleteTransaction(5L, 1L);

        verify(transactionRepository).deleteByIdAndUserId(5L, 1L);
    }

    @Test
    void clearTransactions_callsRepository() {
        transactionService.clearTransactions(1L, "Food", "EXPENSE");

        verify(transactionRepository).deleteByUserIdAndCategoryNameAndType(1L, "Food", "EXPENSE");
    }
}
