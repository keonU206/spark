package com.spark.backend.home;

import com.spark.backend.home.dto.HomeDtos.HomeSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/home")
    public HomeSummaryResponse home(@AuthenticationPrincipal Long userId) {
        return homeService.summary(userId);
    }
}
