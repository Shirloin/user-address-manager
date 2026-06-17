package com.assessment.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {

    private String id;
    private String userId;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String country;
}
