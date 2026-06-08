import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/** クライアント生成 UUID（打刻の冪等キー）を発行する。 */
export function newId(): string {
  return uuidv4();
}
