package com.spark.backend.upload;

import com.spark.backend.common.error.ApiException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 이미지 업로드 — 프로필 사진·피드 사진용.
 * 해커톤 규모라 서버 로컬 디스크에 저장하고 /uploads/** 로 서빙한다.
 * (운영 전환 시 S3 presigned URL 방식으로 교체 지점)
 */
@RestController
public class UploadController {

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final Path uploadDir;

    public UploadController(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public record UploadResponse(String url) {
    }

    @PostMapping("/uploads")
    public UploadResponse upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "파일이 비어 있어요.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "UNSUPPORTED_FILE_TYPE",
                    "이미지 파일만 올릴 수 있어요.");
        }

        String extension = switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
        String filename = UUID.randomUUID() + extension;

        try {
            Files.createDirectories(uploadDir);
            file.transferTo(uploadDir.resolve(filename));
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED",
                    "업로드에 실패했어요. 다시 시도해주세요.");
        }

        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/").path(filename).toUriString();
        return new UploadResponse(url);
    }
}
