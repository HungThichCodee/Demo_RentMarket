package com.example.Indentity_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    String id;

    @Size(min = 3, max = 20, message = "USERNAME_INVALID")
    String username;

    @Size(min = 8, message = "PASSWORD_INVALD")
    String password;
    String firstName;
    String lastName;

    @NotNull(message = "Không được để trống email")
    @Email(message = "EMAIL_INVALID")
    String email;
}
