package com.ims.auth.config;

import com.ims.auth.entity.Role;
import com.ims.auth.entity.User;
import com.ims.auth.repository.RoleRepository;
import com.ims.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create roles if not exist
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_ADMIN")
                        .description("Administrator with full access")
                        .build()));

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_USER")
                        .description("Warehouse/Store staff user")
                        .build()));

        // Create admin user if not exist
        if (!userRepository.existsByEmail("admin@demo.com")) {
            User admin = User.builder()
                    .email("admin@demo.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .firstName("Admin")
                    .lastName("User")
                    .active(true)
                    .roles(Set.of(adminRole))
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: admin@demo.com / Admin@123");
        }

        // Create regular user if not exist
        if (!userRepository.existsByEmail("user1@demo.com")) {
            User user1 = User.builder()
                    .email("user1@demo.com")
                    .password(passwordEncoder.encode("User@123"))
                    .firstName("John")
                    .lastName("Warehouse")
                    .active(true)
                    .warehouseId(1L)
                    .roles(Set.of(userRole))
                    .build();
            userRepository.save(user1);
            log.info("User created: user1@demo.com / User@123 (Warehouse 1)");
        }

        // Create another user
        if (!userRepository.existsByEmail("user2@demo.com")) {
            User user2 = User.builder()
                    .email("user2@demo.com")
                    .password(passwordEncoder.encode("User@123"))
                    .firstName("Jane")
                    .lastName("Store")
                    .active(true)
                    .warehouseId(2L)
                    .roles(Set.of(userRole))
                    .build();
            userRepository.save(user2);
            log.info("User created: user2@demo.com / User@123 (Warehouse 2)");
        }

        log.info("Data initialization completed");
    }
}
