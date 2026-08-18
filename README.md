# 스파크 (Spark)

친구와 함께 하루 5분 운동을 습관으로 만드는 소셜 루틴 앱.

## 저장소 구조

| 폴더 | 내용 | 시작하기 |
|------|------|----------|
| [spark-frontend/](spark-frontend/) | Expo(React Native) 앱 — 화면 28개 완성 | [spark-frontend/README.md](spark-frontend/README.md) |
| [spark-backend/](spark-backend/) | Spring Boot 4 API 서버 (포트 4000) | `cd spark-backend && ./gradlew bootRun` |
| [docs/](docs/) | **API 계약서** · ERD · 화면 명세 — 프론트·백엔드 공용 | [docs/api-contract.md](docs/api-contract.md) |

## 빠른 시작

```bash
# 프론트 (폴더 주의: spark-frontend 안에서)
cd spark-frontend
npm install
npx expo start          # 폰의 dev client 앱으로 QR 스캔

# 백엔드 (XAMPP MariaDB 3306이 켜져 있어야 함)
cd spark-backend
./gradlew bootRun       # http://localhost:4000
```

프론트·백엔드 연동 방법은 [docs/api-contract.md](docs/api-contract.md)의 "연결 절차" 참고.
