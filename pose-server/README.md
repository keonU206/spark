# Spark Pose Server

MediaPipe Pose 기반 카메라 분석 서버입니다. MediaPipe는 전신 33개 좌표를 추론하고,
서버는 운동별로 필요한 관절만 검증·계산·응답합니다.

```powershell
cd pose-server
python -m venv .venv
.\.venv\Scripts\pip.exe install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8001
```

프론트엔드 `.env.local`:

```env
EXPO_PUBLIC_AI_BASE_URL=http://localhost:8001/api/v1
```

확인: `http://localhost:8001/health`
