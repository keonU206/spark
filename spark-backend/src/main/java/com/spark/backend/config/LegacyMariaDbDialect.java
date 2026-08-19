package com.spark.backend.config;

import org.hibernate.dialect.MariaDBDialect;

/**
 * XAMPP가 쓰는 MariaDB 10.4용 방언.
 *
 * Hibernate 7의 기본 MariaDB 방언은 스키마 갱신 시 "ALTER TABLE IF EXISTS ..."를 생성하는데,
 * 이 문법은 MariaDB 10.5부터 지원된다. 10.4에서는 모든 ALTER가 문법 오류로 조용히 실패해서
 * 새 컬럼·제약이 자동으로 반영되지 않는다 (seen_at/session_id가 누락됐던 원인).
 * IF EXISTS를 붙이지 않게 해서 ddl-auto: update가 10.4에서도 동작하게 한다.
 */
public class LegacyMariaDbDialect extends MariaDBDialect {

    @Override
    public boolean supportsIfExistsAfterAlterTable() {
        return false;
    }
}
