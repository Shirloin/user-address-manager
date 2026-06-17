package com.assessment.userservice.controller;

import com.assessment.userservice.dto.AddressDto;
import com.assessment.userservice.dto.CreateAddressRequest;
import com.assessment.userservice.dto.CreateUserRequest;
import com.assessment.userservice.dto.UpdateUserRequest;
import com.assessment.userservice.dto.UserDetailDto;
import com.assessment.userservice.dto.UserSummaryDto;
import com.assessment.userservice.service.AddressService;
import com.assessment.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AddressService addressService;

    @GetMapping
    public List<UserSummaryDto> list() {
        return userService.listUsers();
    }

    @GetMapping("/{id}")
    public UserDetailDto get(@PathVariable String id) {
        return userService.getUser(id);
    }

    @PostMapping
    public ResponseEntity<UserSummaryDto> create(@Valid @RequestBody CreateUserRequest request) {
        UserSummaryDto created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public UserDetailDto update(@PathVariable String id,
                                @Valid @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }

    @PostMapping("/{id}/addresses")
    public ResponseEntity<AddressDto> addAddress(@PathVariable String id,
                                                 @Valid @RequestBody CreateAddressRequest request) {
        AddressDto created = addressService.addAddress(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
