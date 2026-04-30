export interface ApiRequest<T = unknown> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: T;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

export interface InterceptorCallbacks {
  onRequest?: <T>(config: ApiRequest<T>) => ApiRequest<T> | Promise<ApiRequest<T>>;
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?: (error: Error) => void;
}

class ApiInterceptor {
  private callbacks: InterceptorCallbacks = {};

  setCallbacks(callbacks: InterceptorCallbacks) {
    this.callbacks = callbacks;
  }

  async request<T>(config: ApiRequest<T>): Promise<ApiResponse<T>> {
    try {
      let finalConfig = config;

      if (this.callbacks.onRequest) {
        finalConfig = await this.callbacks.onRequest(config);
      }

      const response = await this.executeRequest(finalConfig);

      if (this.callbacks.onResponse) {
        return await this.callbacks.onResponse(response);
      }

      return response;
    } catch (error) {
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  private async executeRequest<T>(config: ApiRequest<T>): Promise<ApiResponse<T>> {
    console.log(`[API] ${config.method ?? "GET"} ${config.url}`);
    return {
      data: {} as T,
      status: 200,
      message: "OK",
    };
  }
}

export const api = new ApiInterceptor();