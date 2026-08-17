import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

/** 온보딩 페이지 인디케이터. 시안: ⌀10, 간격 27(중심 간), 활성=메인 / 비활성=Gray6 */
export function PageIndicator({ count, index }: { count: number; index: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: i === index ? colors.main : colors.gray6 }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8.5,
  },
});
