package com.spark.backend;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SparkBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SparkBackendApplication.class, args);
	}

	/** 스트릭·출석은 "한국의 하루" 기준 — 서버가 어디에 배포되든 KST로 계산한다 */
	@PostConstruct
	void setDefaultTimezone() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
	}
}
