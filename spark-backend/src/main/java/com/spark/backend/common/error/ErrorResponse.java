package com.spark.backend.common.error;

/** message는 사용자에게 그대로 표시되므로 반드시 완성된 한국어 문장이어야 한다 */
public record ErrorResponse(String message, String code) {
}
