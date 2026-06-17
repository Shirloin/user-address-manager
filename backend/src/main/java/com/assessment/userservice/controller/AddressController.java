package com.assessment.userservice.controller;

import com.assessment.userservice.dto.AddressDto;
import com.assessment.userservice.dto.UpdateAddressRequest;
import com.assessment.userservice.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PutMapping("/{addressId}")
    public AddressDto update(@PathVariable String addressId,
                             @Valid @RequestBody UpdateAddressRequest request) {
        return addressService.updateAddress(addressId, request);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> delete(@PathVariable String addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }
}
