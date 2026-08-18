import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';

/**
 * 웹용 대체 프리뷰.
 *
 * vision-camera는 네이티브 모듈이라 웹 번들에 넣을 수 없다.
 * Metro가 플랫폼 확장자로 이 파일을 골라주므로, 웹에서는 vision-camera가 아예 로드되지 않는다.
 */
export function CameraView({
  isActive,
  onReady,
}: {
  isActive: boolean;
  onReady?: (ready: boolean) => void;
}) {
  void isActive;

  useEffect(() => {
    // 웹에서는 실제 카메라가 없으므로 mock 골격으로 떨어지게 한다
    onReady?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.fallback}>
      <Text style={styles.label}>카메라 미리보기</Text>
      <Text style={styles.hint}>개발 빌드에서 실제 카메라가 표시됩니다</Text>
    </View>
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
