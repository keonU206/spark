// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro는 `.tflite`를 기본 에셋으로 다루지 않는다.
// 등록해야 `require('...movenet.tflite')`가 번들에 포함된다.
config.resolver.assetExts.push('tflite');

module.exports = config;
