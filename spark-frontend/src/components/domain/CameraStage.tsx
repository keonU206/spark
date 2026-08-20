import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { CameraView } from '@/components/domain/CameraView';
import { colors } from '@/theme/tokens';
import { KEYPOINT_SCORE_THRESHOLD, POSE_EDGES, type Pose } from '@/types/pose';

/**
 * 운동 진행 화면의 카메라 무대 — Figma `81:1248`, `81:1448`
 *
 * 카메라 프리뷰 위에 주황 골격(관절 점 + 연결선)을 겹친다.
 *
 * 프리뷰는 `CameraView`가 담당한다. Metro가 플랫폼별로 골라주므로
 * 웹에서는 회색 판, 개발 빌드에서는 실제 카메라가 붙는다.
 */
export function CameraStage({
  pose,
  paused,
  onSourceReady,
  onFrame,
}: {
  pose: Pose | null;
  paused: boolean;
  /** 실제 카메라를 쓸 수 있는지 상위(세션 화면)에 알려준다 */
  onSourceReady?: (ready: boolean) => void;
  onFrame?: (base64: string) => void;
}) {
  return (
    <View style={styles.stage}>
      <CameraView isActive={!paused} onReady={onSourceReady} onFrame={onFrame} />
      {pose && !paused ? <PoseOverlay pose={pose} /> : null}
    </View>
  );
}

/** 정규화 좌표(0~1)를 그대로 viewBox 0~1에 그린다 — 프리뷰 크기와 무관해진다 */
function PoseOverlay({ pose }: { pose: Pose }) {
  const byName = useMemo(() => new Map(pose.keypoints.map((k) => [k.name, k])), [pose]);

  const visible = (name: string) => {
    const k = byName.get(name as never);
    return k && k.score >= KEYPOINT_SCORE_THRESHOLD ? k : undefined;
  };

  return (
    <Svg style={styles.overlay} viewBox="0 0 4 3" preserveAspectRatio="xMidYMid meet">
      {POSE_EDGES.map(([from, to]) => {
        const a = visible(from);
        const b = visible(to);
        if (!a || !b) return null;
        return (
          <Line
            key={`${from}-${to}`}
            x1={a.x * 4}
            y1={a.y * 3}
            x2={b.x * 4}
            y2={b.y * 3}
            stroke={colors.main}
            strokeWidth={0.02}
            strokeLinecap="round"
          />
        );
      })}

      {pose.keypoints
        .filter((k) => k.score >= KEYPOINT_SCORE_THRESHOLD)
        .map((k) => (
          <Circle key={k.name} cx={k.x * 4} cy={k.y * 3} r={0.045} fill={colors.main} />
        ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
