package com.example.pennywisev1.controller;

import com.example.pennywisev1.service.TestService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping("/hello/{id}")
    public String test(@PathVariable Long id) {
        return testService.getHelloWorld(id);
    }
}
