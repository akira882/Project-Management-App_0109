// Expo Metro 設定（ユニバーサル: iOS / Android / Web）。
// @supabase/supabase-js は任意依存 '@opentelemetry/api'（分散トレーシング）を
// 動的 import するが、本アプリでは未使用。未インストールだと Web 出力（Metro バンドル）が
// 解決に失敗するため、空モジュールにスタブして無効化する。
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@opentelemetry/api') {
    // Metro に空モジュールとして解決させる（実行時は no-op）。
    return { type: 'empty' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
