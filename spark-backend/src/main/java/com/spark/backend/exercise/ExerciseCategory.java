package com.spark.backend.exercise;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 운동 카테고리. "전체"(id: all)는 저장하지 않고 API가 목록 앞에 붙여준다 — docs/erd.md §2
 * 마스터 데이터는 mock 시드와 id를 맞추기 위해 문자열 PK를 쓴다.
 */
@Entity
@Table(name = "exercise_categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExerciseCategory {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int sortOrder;

    @Builder
    private ExerciseCategory(String id, String name, int sortOrder) {
        this.id = id;
        this.name = name;
        this.sortOrder = sortOrder;
    }
}
