module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // expo-router用
      require.resolve('expo-router/babel'),
      // react-native-reanimated用（最後に配置）
      'react-native-reanimated/plugin',
    ],
  };
};
