package com.assessment.userservice.repository;

import com.assessment.userservice.model.Address;

import java.util.List;
import java.util.Optional;

public interface AddressRepository {

    List<Address> findByUserId(String userId);

    Optional<Address> findById(String id);

    Address save(Address address);

    boolean deleteById(String id);
}
