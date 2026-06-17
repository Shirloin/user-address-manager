package com.assessment.userservice.service;

import com.assessment.userservice.dto.CreateUserRequest;
import com.assessment.userservice.dto.UpdateUserRequest;
import com.assessment.userservice.dto.UserDetailDto;
import com.assessment.userservice.dto.UserSummaryDto;

import java.util.List;

public interface UserService {

    List<UserSummaryDto> listUsers();

    UserDetailDto getUser(String id);

    UserSummaryDto createUser(CreateUserRequest request);

    UserDetailDto updateUser(String id, UpdateUserRequest request);
}
