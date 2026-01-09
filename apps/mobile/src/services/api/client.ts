import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Config from '@/config';
import type { ApiResponse } from '@project-management/shared';

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * APIクライアントクラス
 * 型安全でセキュアなHTTP通信を提供
 */
class ApiClient {
  private client: AxiosInstance;
  private requestCount: number = 0;

  constructor() {
    // Axiosインスタンスの作成
    this.client = axios.create({
      baseURL: Config.API_BASE_URL,
      timeout: Config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // リクエストインターセプター
    this.client.interceptors.request.use(
      (config) => {
        this.requestCount++;

        // デバッグログ（開発環境のみ）
        if (Config.DEBUG_MODE) {
          console.log(`[API Request #${this.requestCount}]`, {
            method: config.method?.toUpperCase(),
            url: config.url,
            // データは機密情報を含む可能性があるため除外
          });
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター
    this.client.interceptors.response.use(
      (response) => {
        // デバッグログ
        if (Config.DEBUG_MODE) {
          console.log('[API Response]', {
            status: response.status,
            url: response.config.url,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // サーバーがエラーレスポンスを返した
      const data = error.response.data as ApiResponse | undefined;
      const message = data?.error?.message || 'サーバーエラーが発生しました';
      const code = data?.error?.code || 'SERVER_ERROR';

      return new ApiError(
        message,
        error.response.status,
        code,
        data?.error?.details
      );
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      return new ApiError(
        'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        undefined,
        'NETWORK_ERROR'
      );
    } else {
      // リクエスト設定中にエラーが発生
      return new ApiError(
        error.message || '予期しないエラーが発生しました',
        undefined,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * GETリクエスト
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);

      if (!response.data.success) {
        throw new ApiError(
          response.data.error?.message || 'エラーが発生しました',
          response.status,
          response.data.error?.code
        );
      }

      return response.data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * POSTリクエスト
   */
  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(
        url,
        data,
        config
      );

      if (!response.data.success) {
        throw new ApiError(
          response.data.error?.message || 'エラーが発生しました',
          response.status,
          response.data.error?.code
        );
      }

      return response.data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * PUTリクエスト
   */
  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(
        url,
        data,
        config
      );

      if (!response.data.success) {
        throw new ApiError(
          response.data.error?.message || 'エラーが発生しました',
          response.status,
          response.data.error?.code
        );
      }

      return response.data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * PATCHリクエスト
   */
  async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(
        url,
        data,
        config
      );

      if (!response.data.success) {
        throw new ApiError(
          response.data.error?.message || 'エラーが発生しました',
          response.status,
          response.data.error?.code
        );
      }

      return response.data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * DELETEリクエスト
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);

      if (!response.data.success) {
        throw new ApiError(
          response.data.error?.message || 'エラーが発生しました',
          response.status,
          response.data.error?.code
        );
      }

      return response.data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * リクエストカウントをリセット
   */
  resetRequestCount(): void {
    this.requestCount = 0;
  }

  /**
   * ベースURLを取得
   */
  getBaseURL(): string {
    return this.client.defaults.baseURL || '';
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient();
export default apiClient;
