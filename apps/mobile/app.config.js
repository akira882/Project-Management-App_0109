import 'dotenv/config';

export default {
  expo: {
    name: 'プロジェクト管理アプリ',
    slug: 'project-management-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.projectmanagement.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.projectmanagement.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    scheme: 'projectmanagement',
    extra: {
      // 環境変数を安全に公開
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      apiTimeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
      appEnv: process.env.APP_ENV || 'development',
      debugMode: process.env.DEBUG_MODE === 'true',
      eas: {
        projectId: 'your-project-id-here',
      },
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
          ios: {
            deploymentTarget: '13.0',
          },
        },
      ],
    ],
  },
};
