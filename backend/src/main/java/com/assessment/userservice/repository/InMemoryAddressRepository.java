package com.assessment.userservice.repository;

import com.assessment.userservice.model.Address;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryAddressRepository implements AddressRepository {

    private final ConcurrentHashMap<String, Address> addresses = new ConcurrentHashMap<>();

    @Override
    public List<Address> findByUserId(String userId) {
        return addresses.values().stream()
                .filter(a -> a.getUserId().equals(userId))
                .sorted(Comparator.comparing(Address::getId))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Address> findById(String id) {
        return Optional.ofNullable(addresses.get(id));
    }

    @Override
    public Address save(Address address) {
        addresses.put(address.getId(), address);
        return address;
    }

    @Override
    public boolean deleteById(String id) {
        return addresses.remove(id) != null;
    }
}
