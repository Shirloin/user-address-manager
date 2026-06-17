package com.assessment.userservice.repository;

import com.assessment.userservice.model.User;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryUserRepository implements UserRepository {

    private final ConcurrentHashMap<String, User> users = new ConcurrentHashMap<>();

    @Override
    public List<User> findAll() {
        return users.values().stream()
                .sorted(Comparator.comparing(User::getId))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<User> findById(String id) {
        return Optional.ofNullable(users.get(id));
    }

    @Override
    public Optional<User> findByEmailIgnoreCase(String email) {
        if (email == null) {
            return Optional.empty();
        }
        return users.values().stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst();
    }

    @Override
    public User save(User user) {
        users.put(user.getId(), user);
        return user;
    }

    @Override
    public boolean existsById(String id) {
        return users.containsKey(id);
    }
}
