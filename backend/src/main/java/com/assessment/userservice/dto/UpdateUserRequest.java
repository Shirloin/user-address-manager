package com.assessment.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @NotBlank(message = "firstName is required")
    @Size(max = 50, message = "firstName must be at most 50 characters")
    private String firstName;

    @NotBlank(message = "lastName is required")
    @Size(max = 50, message = "lastName must be at most 50 characters")
    private String lastName;

    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid address")
    @Size(max = 100, message = "email must be at most 100 characters")
    private String email;
}
