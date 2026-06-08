module.exports = function (api) {
  api.cache(true);
  return {
    // Expo SDK 50 では expo-router のトランスフォームは babel-preset-expo に統合済み。
    // （旧 'expo-router/babel' プラグインは非推奨のため追加しない）
    presets: ['babel-preset-expo'],
  };
};
