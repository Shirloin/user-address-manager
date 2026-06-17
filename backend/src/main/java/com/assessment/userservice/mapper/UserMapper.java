package com.assessment.userservice.mapper;

import com.assessment.userservice.dto.AddressDto;
import com.assessment.userservice.dto.UserDetailDto;
import com.assessment.userservice.dto.UserSummaryDto;
import com.assessment.userservice.model.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserMapper {

    public UserSummaryDto toSummary(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    public UserDetailDto toDetail(User user, List<AddressDto> addresses) {
        return UserDetailDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .addresses(addresses)
                .build();
    }
}
