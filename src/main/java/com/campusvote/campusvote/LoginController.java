package com.campusvote.campusvote;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    private final UserRepository userRepository;

    public LoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {

        String username = loginData.get("username");
        String password = loginData.get("password");

        User user = userRepository.findByUsername(username);

        if (user != null && user.getPassword().equals(password)) {

            return Map.of(
                "success", true,
                "message", "Login successful",
                "role", user.getRole(),
                "name", user.getName(),
                "userId", user.getId()
            );
        }

        return Map.of(
            "success", false,
            "message", "Invalid username or password"
        );
    }

    @GetMapping("/students/count")
    public Map<String, Long> getStudentCount() {

        long count = userRepository.countByRole("student");

        return Map.of(
            "count", count
        );
    }
}