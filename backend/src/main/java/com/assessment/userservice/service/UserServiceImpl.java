package com.assessment.userservice.service;

import com.assessment.userservice.dto.AddressDto;
import com.assessment.userservice.dto.CreateUserRequest;
import com.assessment.userservice.dto.UpdateUserRequest;
import com.assessment.userservice.dto.UserDetailDto;
import com.assessment.userservice.dto.UserSummaryDto;
import com.assessment.userservice.exception.InvalidRequestException;
import com.assessment.userservice.exception.ResourceNotFoundException;
import com.assessment.userservice.mapper.AddressMapper;
import com.assessment.userservice.mapper.UserMapper;
import com.assessment.userservice.model.User;
import com.assessment.userservice.repository.AddressRepository;
import com.assessment.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;

    @Override
    public List<UserSummaryDto> listUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toSummary)
                .collect(Collectors.toList());
    }

    @Override
    public UserDetailDto getUser(String id) {
        User user = requireUser(id);
        List<AddressDto> addressDtos = addressRepository.findByUserId(id).stream()
                .map(addressMapper::toDto)
                .collect(Collectors.toList());
        return userMapper.toDetail(user, addressDtos);
    }

    @Override
    public UserSummaryDto createUser(CreateUserRequest request) {
        String email = request.getEmail().trim();
        assertEmailAvailable(email, null);
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .build();
        userRepository.save(user);
        log.info("Created user {}", user.getId());
        return userMapper.toSummary(user);
    }

    @Override
    public UserDetailDto updateUser(String id, UpdateUserRequest request) {
        User user = requireUser(id);
        String email = request.getEmail().trim();
        assertEmailAvailable(email, id);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        userRepository.save(user);
        log.info("Updated user {}", id);
        return getUser(id);
    }

    private User requireUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
    }

    private void assertEmailAvailable(String email, String excludeUserId) {
        Optional<User> existing = userRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent() && !existing.get().getId().equals(excludeUserId)) {
            throw new InvalidRequestException("email is already in use");
        }
    }
}
