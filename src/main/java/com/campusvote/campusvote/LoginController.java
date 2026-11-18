
package com.campusvote.campusvote;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody Map<String, String> loginData) {

        String username = loginData.get("username");
        String password = loginData.get("password");

        User user = userRepository.findByUsername(username);

        if (user != null && password != null) {

            String storedPassword = user.getPassword();

            boolean passwordMatches = false;

            if (storedPassword != null &&
                    storedPassword.startsWith("$2")) {

                passwordMatches =
                        passwordEncoder.matches(password, storedPassword);

            } else if (storedPassword != null &&
                    storedPassword.equals(password)) {

                passwordMatches = true;

                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }

            if (passwordMatches) {
                return Map.of(
                    "success", true,
                    "message", "Login successful",
                    "role", user.getRole(),
                    "name", user.getName(),
                    "userId", user.getId()
                );
            }
        }

        return Map.of(
            "success", false,
            "message", "Invalid username or password"
        );
    }

    @GetMapping("/students/count")
    public Map<String, Long> getStudentCount() {

        long count = userRepository.countByRole("student");

        return Map.of("count", count);
    }
}
