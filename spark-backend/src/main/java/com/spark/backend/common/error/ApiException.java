package com.spark.backend.common.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 화면에 그대로 노출되는 message와 분기 처리용 code를 담는 예외.
 * 프론트 규약: 4xx/5xx 응답 본문 { message, code } — docs/api-contract.md §1
 */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
