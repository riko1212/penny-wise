package com.example.pennywisev1.service;

import com.example.pennywisev1.repository.TestRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TestService {

    private final TestRepository testRepository;

    public TestService(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    public String getHelloWorld(Long id) {
        String message = testRepository.findMessageById(id);
        if (message == null) {
            System.out.println("No message found for id: " + id);
        } else {
            System.out.println("Found message for id: " + id);
        }
        return Optional.ofNullable(message)
                .orElse("Message not found for id: " + id);
    }
}
