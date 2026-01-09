import Constants from 'expo-constants';

/**
 * 環境変数を安全に取得するためのヘルパー
 */
class Config {
  private static getExtra(key: string, defaultValue?: string): string {
    const extra = Constants.expoConfig?.extra;
    return extra?.[key] ?? defaultValue ?? '';
  }

  // API設定
  static get API_BASE_URL(): string {
    return this.getExtra('apiBaseUrl', 'http://localhost:3000');
  }

  static get API_TIMEOUT(): number {
    return parseInt(this.getExtra('apiTimeout', '30000'), 10);
  }

  // アプリ環境
  static get APP_ENV(): 'development' | 'staging' | 'production' {
    const env = this.getExtra('appEnv', 'development');
    return env as 'development' | 'staging' | 'production';
  }

  static get IS_DEV(): boolean {
    return this.APP_ENV === 'development';
  }

  static get IS_PROD(): boolean {
    return this.APP_ENV === 'production';
  }

  // デバッグ設定
  static get DEBUG_MODE(): boolean {
    return this.getExtra('debugMode', 'false') === 'true';
  }

  // アプリ情報
  static get APP_VERSION(): string {
    return Constants.expoConfig?.version ?? '1.0.0';
  }

  static get APP_NAME(): string {
    return Constants.expoConfig?.name ?? 'プロジェクト管理アプリ';
  }

  // プラットフォーム情報
  static get IS_IOS(): boolean {
    return Constants.platform?.ios !== undefined;
  }

  static get IS_ANDROID(): boolean {
    return Constants.platform?.android !== undefined;
  }

  static get IS_WEB(): boolean {
    return Constants.platform?.web !== undefined;
  }

  // デバイス情報
  static get DEVICE_NAME(): string {
    return Constants.deviceName ?? 'Unknown Device';
  }

  // セキュリティ: 機密情報をログに出力しないためのヘルパー
  static getSafeConfig(): Record<string, unknown> {
    return {
      apiBaseUrl: this.API_BASE_URL,
      appEnv: this.APP_ENV,
      appVersion: this.APP_VERSION,
      platform: {
        ios: this.IS_IOS,
        android: this.IS_ANDROID,
        web: this.IS_WEB,
      },
      // 機密情報は含めない
    };
  }

  // 設定の検証
  static validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.API_BASE_URL) {
      errors.push('API_BASE_URL is not configured');
    }

    if (!this.API_BASE_URL.startsWith('http://') && !this.API_BASE_URL.startsWith('https://')) {
      errors.push('API_BASE_URL must start with http:// or https://');
    }

    if (this.IS_PROD && this.API_BASE_URL.includes('localhost')) {
      errors.push('Cannot use localhost in production environment');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default Config;
