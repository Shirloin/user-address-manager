package com.assessment.userservice.repository;

import com.assessment.userservice.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {

    List<User> findAll();

    Optional<User> findById(String id);

    Optional<User> findByEmailIgnoreCase(String email);

    User save(User user);

    boolean existsById(String id);
}
