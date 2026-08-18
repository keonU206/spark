package com.spark.backend.me;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * AI PT(자세 분석) 동의. cameraPermissionGranted는 기기 상태라 저장하지 않는다.
 * 현재 기획상 영상·자세 데이터는 서버에 저장하지 않으므로(온디바이스 추론) 철회 시 삭제할 데이터도 없다.
 */
@Entity
@Table(name = "user_consents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserConsent {

    @Id
    private Long userId;

    @Column(nullable = false)
    private boolean poseAnalysisAgreed;

    private LocalDateTime agreedAt;

    private LocalDateTime revokedAt;

    @Builder
    private UserConsent(Long userId) {
        this.userId = userId;
        this.poseAnalysisAgreed = false;
    }

    public void setAgreed(boolean agreed) {
        if (this.poseAnalysisAgreed == agreed) {
            return;
        }
        this.poseAnalysisAgreed = agreed;
        if (agreed) {
            this.agreedAt = LocalDateTime.now();
            this.revokedAt = null;
        } else {
            this.revokedAt = LocalDateTime.now();
        }
    }
}
