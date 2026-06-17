package com.assessment.userservice.service;

import com.assessment.userservice.dto.AddressDto;
import com.assessment.userservice.dto.CreateAddressRequest;
import com.assessment.userservice.dto.UpdateAddressRequest;

public interface AddressService {

    AddressDto addAddress(String userId, CreateAddressRequest request);

    AddressDto updateAddress(String addressId, UpdateAddressRequest request);

    void deleteAddress(String addressId);
}
