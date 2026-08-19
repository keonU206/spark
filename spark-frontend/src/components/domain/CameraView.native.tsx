import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { colors, fontFamily } from '@/theme/tokens';

/**
 * 실제 카메라 프리뷰 (네이티브 전용).
 *
 * Metro가 플랫폼 확장자로 골라준다 — 웹에서는 `CameraView.web.tsx`가 대신 잡히므로
 * 웹 번들에 vision-camera가 들어가지 않는다.
 *
 * 자세 인식용이라 **전면 카메라**를 기본으로 쓴다. 폰을 세워두고 자기 모습을 보며
 * 운동하는 흐름이기 때문이다. 전면이 없으면 후면으로 떨어진다.
 */
export function CameraView({
  isActive,
  onReady,
  onFrame,
}: {
  isActive: boolean;
  onReady?: (ready: boolean) => void;
  onFrame?: (base64: string) => void;
}) {
  void onFrame;
  const { hasPermission, requestPermission } = useCameraPermission();
  const front = useCameraDevice('front');
  const back = useCameraDevice('back');
  const device = front ?? back;

  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (hasPermission) return;
    void requestPermission().then((granted) => setDenied(!granted));
  }, [hasPermission, requestPermission]);

  const ready = hasPermission && !!device;

  useEffect(() => {
    onReady?.(ready);
    // onReady는 매 렌더 새로 만들어질 수 있어 의존성에서 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.label}>카메라 미리보기</Text>
        <Text style={styles.hint}>
          {denied
            ? '기기 설정에서 카메라 접근을 허용해주세요.'
            : !device
              ? '사용할 수 있는 카메라를 찾지 못했어요.'
              : '카메라를 준비하고 있어요…'}
        </Text>
      </View>
    );
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      // 사진·영상 저장은 하지 않는다. 자세 인식에만 쓴다
      photo={false}
      video={false}
      audio={false}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
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
  label: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.white,
    opacity: 0.85,
    marginTop: 4,
    textAlign: 'center',
  },
});
