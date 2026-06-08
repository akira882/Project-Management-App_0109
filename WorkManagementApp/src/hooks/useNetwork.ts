import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * ネットワーク接続状態を購読するフック。
 *
 * `isConnected` は「物理的に接続済み（isConnected）」かつ「到達性が否定されていない
 * （isInternetReachable !== false）」場合に true とする。isInternetReachable は判定前 null を
 * 取り得るため、明示的に false のときのみオフライン扱いにする（null は接続済みとみなす）。
 */

/** NetInfo の状態から実効的なオンライン判定を導出する。 */
function deriveConnected(state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}): boolean {
  return Boolean(state.isConnected) && state.isInternetReachable !== false;
}

export function useNetwork(): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    // 初期値を fetch() で取得する（購読前の状態を反映）。
    NetInfo.fetch().then((state) => {
      if (mounted) {
        setIsConnected(deriveConnected(state));
      }
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(deriveConnected(state));
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isConnected };
}
