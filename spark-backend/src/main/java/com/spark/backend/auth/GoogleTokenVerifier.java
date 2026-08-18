package com.spark.backend.auth;

import com.spark.backend.common.error.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * 구글 idToken 검증. 앱이 보낸 토큰을 그대로 믿지 않고 구글에 확인한다.
 * tokeninfo 엔드포인트가 서명·만료를 검증해주므로 audience만 추가로 확인한다.
 */
@Component
public class GoogleTokenVerifier {

    public record GoogleUser(String providerUserId, String email, String name) {
    }

    private final RestClient restClient = RestClient.create("https://oauth2.googleapis.com");
    private final String clientId;

    public GoogleTokenVerifier(@Value("${app.google.client-id}") String clientId) {
        this.clientId = clientId;
    }

    public GoogleUser verify(String idToken) {
        if (clientId == null || clientId.isBlank()) {
            throw new ApiException(HttpStatus.NOT_IMPLEMENTED, "SOCIAL_LOGIN_NOT_CONFIGURED",
                    "구글 로그인은 아직 준비 중이에요.");
        }
        TokenInfo info;
        try {
            info = restClient.get()
                    .uri(uri -> uri.path("/tokeninfo").queryParam("id_token", idToken).build())
                    .retrieve()
                    .body(TokenInfo.class);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_SOCIAL_TOKEN",
                    "구글 로그인에 실패했어요. 다시 시도해주세요.");
        }
        if (info == null || info.sub() == null || !clientId.equals(info.aud())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_SOCIAL_TOKEN",
                    "구글 로그인에 실패했어요. 다시 시도해주세요.");
        }
        return new GoogleUser(info.sub(), info.email(), info.name());
    }

    private record TokenInfo(String sub, String aud, String email, String name) {
    }
}
