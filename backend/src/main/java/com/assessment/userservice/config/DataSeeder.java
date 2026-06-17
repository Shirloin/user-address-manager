package com.assessment.userservice.config;

import com.assessment.userservice.model.Address;
import com.assessment.userservice.model.User;
import com.assessment.userservice.repository.AddressRepository;
import com.assessment.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    @Override
    public void run(String... args) {
        User ada = userRepository.save(User.builder()
                .id("u-1")
                .email("ada.lovelace@example.com")
                .firstName("Ada")
                .lastName("Lovelace")
                .build());
        User alan = userRepository.save(User.builder()
                .id("u-2")
                .email("alan.turing@example.com")
                .firstName("Alan")
                .lastName("Turing")
                .build());
        User grace = userRepository.save(User.builder()
                .id("u-3")
                .email("grace.hopper@example.com")
                .firstName("Grace")
                .lastName("Hopper")
                .build());
        // Linus is intentionally left without addresses to exercise the empty state.
        userRepository.save(User.builder()
                .id("u-4")
                .email("linus.torvalds@example.com")
                .firstName("Linus")
                .lastName("Torvalds")
                .build());

        addressRepository.save(Address.builder()
                .id(UUID.randomUUID().toString())
                .userId(ada.getId())
                .street("10 St James's Square")
                .city("London")
                .state("England")
                .zip("SW1Y 4LE")
                .country("UK")
                .build());
        addressRepository.save(Address.builder()
                .id(UUID.randomUUID().toString())
                .userId(ada.getId())
                .street("1 Computing Way")
                .city("Cambridge")
                .state("England")
                .zip("CB2 1TN")
                .country("UK")
                .build());
        addressRepository.save(Address.builder()
                .id(UUID.randomUUID().toString())
                .userId(alan.getId())
                .street("78 High Street")
                .city("Wilmslow")
                .state("Cheshire")
                .zip("SK9 1AT")
                .country("UK")
                .build());
        addressRepository.save(Address.builder()
                .id(UUID.randomUUID().toString())
                .userId(grace.getId())
                .street("200 Navy Yard Rd")
                .city("Arlington")
                .state("VA")
                .zip("22202")
                .country("USA")
                .build());

        log.info("Seeded {} users and {} addresses",
                userRepository.findAll().size(),
                addressRepository.findByUserId(ada.getId()).size()
                        + addressRepository.findByUserId(alan.getId()).size()
                        + addressRepository.findByUserId(grace.getId()).size());
    }
}
