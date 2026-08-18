# 자세 인식 모델

이 폴더에 **MoveNet SinglePose 모델 파일**을 넣어야 실제 자세 인식이 동작합니다.

```
assets/models/movenet.tflite
```

파일이 없으면 앱은 mock 골격으로 대체합니다 — 화면과 진행 흐름은 그대로 확인할 수 있고,
관절 위치만 가짜입니다.

---

## 어떤 모델이 필요한가

| 항목 | 값 |
|------|-----|
| 모델 | MoveNet SinglePose (Lightning 또는 Thunder) |
| 형식 | TensorFlow Lite (`.tflite`) |
| 입력 | `[1, H, W, 3]` uint8 — Lightning 192×192 / Thunder 256×256 |
| 출력 | `[1, 1, 17, 3]` float32 — 관절 17개 × `(y, x, score)` |

**Lightning**은 빠르고 가볍습니다(실시간 우선), **Thunder**는 정확하지만 무겁습니다.
운동 자세 교정은 정확도가 중요하지만, 실시간 오버레이가 끊기면 쓸모가 없으므로
**Lightning으로 시작해서 성능에 여유가 있으면 Thunder로 올리는 순서**를 권합니다.

---

## 받는 곳

TensorFlow Hub / Kaggle Models에서 배포합니다.

- 검색어: `movenet singlepose lightning tflite`
- 배포처: Kaggle Models (구 TensorFlow Hub)

**라이선스를 반드시 확인하세요.** MoveNet은 Apache 2.0으로 배포되는 것이 일반적이지만,
받는 위치와 버전에 따라 조건이 다를 수 있습니다. 상용 배포 전에 확인이 필요합니다.

---

## 넣은 뒤 할 일

파일을 넣기만 하면 됩니다. 코드 수정은 필요 없습니다 —
`src/hooks/usePoseEngine.ts`가 모델 존재 여부를 확인해서 자동으로 실제 추론으로 전환합니다.

입력 크기가 다른 모델(Thunder 256)을 쓸 경우
`src/constants/pose.ts`의 `MODEL_INPUT_SIZE`만 바꾸면 됩니다.
