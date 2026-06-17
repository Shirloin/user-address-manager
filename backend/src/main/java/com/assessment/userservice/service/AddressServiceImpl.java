package com.assessment.userservice.service;

import com.assessment.userservice.dto.AddressDto;
import com.assessment.userservice.dto.CreateAddressRequest;
import com.assessment.userservice.dto.UpdateAddressRequest;
import com.assessment.userservice.exception.ResourceNotFoundException;
import com.assessment.userservice.mapper.AddressMapper;
import com.assessment.userservice.model.Address;
import com.assessment.userservice.repository.AddressRepository;
import com.assessment.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    @Override
    public AddressDto addAddress(String userId, CreateAddressRequest request) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User " + userId + " not found");
        }
        Address address = Address.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .street(request.getStreet().trim())
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .zip(request.getZip().trim())
                .country(request.getCountry().trim())
                .build();
        Address saved = addressRepository.save(address);
        log.info("Added address {} for user {}", saved.getId(), userId);
        return addressMapper.toDto(saved);
    }

    @Override
    public AddressDto updateAddress(String addressId, UpdateAddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address " + addressId + " not found"));
        address.setStreet(request.getStreet().trim());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setZip(request.getZip().trim());
        address.setCountry(request.getCountry().trim());
        Address saved = addressRepository.save(address);
        log.info("Updated address {}", addressId);
        return addressMapper.toDto(saved);
    }

    @Override
    public void deleteAddress(String addressId) {
        if (!addressRepository.deleteById(addressId)) {
            throw new ResourceNotFoundException("Address " + addressId + " not found");
        }
        log.info("Deleted address {}", addressId);
    }
}
