package com.spark.backend.auth;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

/** accessToken(JWT) 발급·검증. refreshToken은 DB 저장형 불투명 토큰이라 여기서 다루지 않는다. */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenMillis;

    public JwtTokenProvider(JwtProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.accessTokenMillis = properties.accessTokenMinutes() * 60_000L;
    }

    public String createAccessToken(Long userId) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenMillis))
                .signWith(key)
                .compact();
    }

    /** 서명·만료가 유효하면 userId를 돌려준다 */
    public Optional<Long> parseUserId(String token) {
        try {
            String subject = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return Optional.of(Long.parseLong(subject));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
