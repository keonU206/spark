import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors, fontFamily } from '@/theme/tokens';
import { KEYPOINT_SCORE_THRESHOLD, POSE_EDGES, type Pose } from '@/types/pose';

/**
 * 운동 진행 화면의 카메라 무대 — Figma `81:1248`, `81:1448`
 *
 * 카메라 프리뷰 위에 주황 골격(관절 점 + 연결선)을 겹친다.
 *
 * 실제 카메라는 개발 빌드에서만 동작한다. 웹 미리보기나 모델 파일이 없을 때는
 * 회색 판 + mock 골격으로 대체해서 레이아웃과 진행 흐름을 확인할 수 있게 한다.
 */
export function CameraStage({
  pose,
  paused,
  onSourceReady,
}: {
  pose: Pose | null;
  paused: boolean;
  /** 실제 카메라 추론이 가능한지 상위(세션 화면)에 알려준다 */
  onSourceReady?: (ready: boolean) => void;
}) {
  const [status, setStatus] = useState<CameraStatus>({ kind: 'checking' });

  useEffect(() => {
    let alive = true;
    resolveCameraStatus().then((next) => {
      if (!alive) return;
      setStatus(next);
      onSourceReady?.(next.kind === 'ready');
    });
    return () => {
      alive = false;
    };
    // onSourceReady는 매 렌더 새로 만들어질 수 있어 의존성에서 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.stage}>
      <CameraPreview status={status} />
      {pose && !paused ? <PoseOverlay pose={pose} /> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 카메라 프리뷰                                                        */
/* ------------------------------------------------------------------ */

type CameraStatus =
  | { kind: 'checking' }
  | { kind: 'ready' }
  | { kind: 'unavailable'; reason: string };

/**
 * 카메라를 쓸 수 있는지 확인한다.
 *
 * `react-native-vision-camera`는 네이티브 모듈이라 웹과 Expo Go에서는 불러올 수 없다.
 * 그래서 정적 import가 아니라 실행 시점에 확인한다.
 */
async function resolveCameraStatus(): Promise<CameraStatus> {
  if (Platform.OS === 'web') {
    return { kind: 'unavailable', reason: '웹에서는 카메라 자세 인식을 쓸 수 없어요.' };
  }

  try {
    // 개발 빌드에만 존재한다
    const module = (await import('react-native-vision-camera')) as {
      Camera?: { requestCameraPermission: () => Promise<string> };
    };
    if (!module.Camera) {
      return { kind: 'unavailable', reason: '카메라 모듈을 찾을 수 없어요.' };
    }

    const permission = await module.Camera.requestCameraPermission();
    if (permission !== 'granted') {
      return { kind: 'unavailable', reason: '기기 설정에서 카메라 접근을 허용해주세요.' };
    }

    return { kind: 'ready' };
  } catch {
    return {
      kind: 'unavailable',
      reason: '개발 빌드에서 실제 카메라가 표시됩니다.',
    };
  }
}

function CameraPreview({ status }: { status: CameraStatus }) {
  if (status.kind === 'ready') {
    // 실제 카메라 뷰는 개발 빌드에서 붙인다 (아래 안내 참고)
    return <View style={styles.preview} />;
  }

  return (
    <View style={styles.preview}>
      <Text style={styles.previewLabel}>카메라 미리보기</Text>
      {status.kind === 'unavailable' ? (
        <Text style={styles.previewHint}>{status.reason}</Text>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 골격 오버레이                                                        */
/* ------------------------------------------------------------------ */

/** 정규화 좌표(0~1)를 그대로 viewBox 0~1에 그린다 — 프리뷰 크기와 무관해진다 */
function PoseOverlay({ pose }: { pose: Pose }) {
  const byName = useMemo(
    () => new Map(pose.keypoints.map((k) => [k.name, k])),
    [pose],
  );

  const visible = (name: string) => {
    const k = byName.get(name as never);
    return k && k.score >= KEYPOINT_SCORE_THRESHOLD ? k : undefined;
  };

  return (
    <Svg style={styles.overlay} viewBox="0 0 1 1" preserveAspectRatio="none">
      {POSE_EDGES.map(([from, to]) => {
        const a = visible(from);
        const b = visible(to);
        if (!a || !b) return null;
        return (
          <Line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={colors.main}
            strokeWidth={0.006}
            strokeLinecap="round"
          />
        );
      })}

      {pose.keypoints
        .filter((k) => k.score >= KEYPOINT_SCORE_THRESHOLD)
        .map((k) => (
          <Circle key={k.name} cx={k.x} cy={k.y} r={0.018} fill={colors.main} />
        ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  preview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#B3B3B3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
  },
  previewHint: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.white,
    opacity: 0.85,
    marginTop: 4,
    textAlign: 'center',
  },
});
