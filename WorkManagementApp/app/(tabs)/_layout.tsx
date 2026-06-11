import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { SyncIndicator } from '@/components/SyncIndicator';

/**
 * 認証済みエリアのタブレイアウト。
 *
 * - 「打刻」「履歴」の2タブ構成。
 * - ヘッダーは青背景・白文字、右上に同期インジケータ（SyncIndicator）。
 * - アイコンはアイコンライブラリ依存を避けるため絵文字テキストで表現する。
 * - タブバー・ヘッダーは現場/シニアでも押しやすいよう大きめに確保する。
 */

/** タブアイコン（絵文字）。色変化に依存せずラベルでも種別を伝える。 */
function TabIcon({ symbol }: { symbol: string }): JSX.Element {
  return <Text style={styles.tabIcon}>{symbol}</Text>;
}

export default function TabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1E40AF' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: styles.headerTitle,
        headerRight: () => <SyncIndicator />,
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#475569',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="attendance"
        options={{
          title: '打刻',
          tabBarLabel: '打刻',
          tabBarIcon: () => <TabIcon symbol="⏱" />,
          tabBarAccessibilityLabel: '打刻タブ',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarLabel: '履歴',
          tabBarIcon: () => <TabIcon symbol="📋" />,
          tabBarAccessibilityLabel: '履歴タブ',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabIcon: {
    fontSize: 22,
  },
});
