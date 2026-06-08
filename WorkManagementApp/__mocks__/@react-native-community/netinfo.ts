/* eslint-disable */
/**
 * @react-native-community/netinfo のテスト用モック。
 * NetInfo は default export のため default と名前付き（addEventListener / fetch）の両方を提供する。
 * __setState / __emit でテストから接続状態を駆動できる。
 */

type NetState = {
  isConnected: boolean;
  isInternetReachable: boolean;
};

let state: NetState = {
  isConnected: true,
  isInternetReachable: true,
};

type Listener = (s: NetState) => void;
const listeners = new Set<Listener>();

export function addEventListener(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function fetch(): Promise<NetState> {
  return Promise.resolve({ ...state });
}

/** テスト用: 接続状態を上書きする。 */
export function __setState(next: Partial<NetState>): void {
  state = { ...state, ...next };
}

/** テスト用: 現在の状態を全リスナーへ通知する。 */
export function __emit(): void {
  for (const cb of listeners) {
    cb({ ...state });
  }
}

const NetInfo = {
  addEventListener,
  fetch,
  __setState,
  __emit,
};

export default NetInfo;
