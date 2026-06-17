package com.assessment.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDto {

    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private List<AddressDto> addresses;
}
