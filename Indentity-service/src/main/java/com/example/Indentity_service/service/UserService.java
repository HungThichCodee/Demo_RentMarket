package com.example.Indentity_service.service;

import com.example.Indentity_service.dto.request.UserCreationRequest;
import com.example.Indentity_service.dto.request.UserUpdateRequest;
import com.example.Indentity_service.dto.response.UserResponse;
import com.example.Indentity_service.entity.User;
import com.example.Indentity_service.enums.Role;
import com.example.Indentity_service.exception.AppException;
import com.example.Indentity_service.exception.ErrorCode;
import com.example.Indentity_service.mapper.UserMapper;
import com.example.Indentity_service.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    private static final long MAX_AVATAR_SIZE = 3 * 1024 * 1024; // 3MB
    private static final String AVATAR_UPLOAD_DIR = "uploads/avatars";

    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<String> roles = new HashSet<>();
        roles.add(Role.USER.name());

        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nguoi dung khong tim thay"));

        userMapper.updateUser(user, request);

        // Chỉ encode password nếu field password thực sự được gửi
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse).toList();
    }

    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nguoi dung khong tim thay")));
    }

    public UserResponse getUserByUsername(String username) {
        return userMapper.toUserResponse(userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Nguoi dung khong tim thay")));
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    /**
     * Upload avatar cho user hiện tại (xác định từ JWT).
     * File lưu vào thư mục uploads/avatars/ với tên UUID unique.
     * Giới hạn: 3MB.
     */
    public UserResponse uploadAvatar(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File ảnh không được để trống");
        }
        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new RuntimeException("Kích thước ảnh tối đa 3MB");
        }

        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        try {
            Path uploadPath = Paths.get(AVATAR_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            user.setAvatarUrl(filename);
            return userMapper.toUserResponse(userRepository.save(user));

        } catch (IOException e) {
            log.error("Lỗi upload avatar cho user {}: {}", username, e.getMessage());
            throw new RuntimeException("Không thể upload ảnh đại diện");
        }
    }

    public UserResponse deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nguoi dung khong tim thay"));
        userRepository.deleteById(userId);
        return userMapper.toUserResponse(user);
    }
}
