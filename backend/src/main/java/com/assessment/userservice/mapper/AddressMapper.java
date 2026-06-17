package com.assessment.userservice.mapper;

import com.assessment.userservice.dto.AddressDto;
import com.assessment.userservice.model.Address;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public AddressDto toDto(Address address) {
        return AddressDto.builder()
                .id(address.getId())
                .userId(address.getUserId())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zip(address.getZip())
                .country(address.getCountry())
                .build();
    }
}
