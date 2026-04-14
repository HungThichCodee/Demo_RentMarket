package com.example.product.service;

import com.example.product.exception.AppException;
import com.example.product.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.file.upload-dir:uploads/images}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create upload directory: {}", this.fileStorageLocation, ex);
            throw new AppException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }

    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown"
        );

        if (originalFileName.contains("..")) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        String fileName = UUID.randomUUID() + "_" + originalFileName;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file: {}", fileName);
            return fileName;
        } catch (IOException ex) {
            log.error("Could not store file {}: {}", fileName, ex.getMessage());
            throw new AppException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(targetLocation);
            log.info("Deleted file: {}", fileName);
        } catch (IOException ex) {
            log.error("Could not delete file {}: {}", fileName, ex.getMessage());
            throw new AppException(ErrorCode.FILE_DELETE_ERROR);
        }
    }
}
