import type { AxiosResponse } from "axios";
import httpClient from "./httpClient";

export async function makePostRequest<TResponse, TBody = unknown>(
  endpoint: string,
  bodyData: TBody
): Promise<AxiosResponse<TResponse>> {
  return httpClient.post<TResponse>(endpoint, bodyData);
}

export async function makeGetRequest<TResponse>(
  endpoint: string
): Promise<AxiosResponse<TResponse>> {
  return httpClient.get<TResponse>(endpoint);
}

export async function makeGetRequestWithParams<TResponse>(
  endpoint: string,
  params: Record<string, unknown> | object
): Promise<AxiosResponse<TResponse>> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });

  if (import.meta.env.DEV) {
    console.log('DEBUG: API Request URL:', `${endpoint}?${query.toString()}`);
  }
  return httpClient.get<TResponse>(`${endpoint}?${query.toString()}`);
}

export async function makePutRequest<TResponse, TBody = unknown>(
  endpoint: string,
  bodyData: TBody
): Promise<AxiosResponse<TResponse>> {
  return httpClient.put<TResponse>(endpoint, bodyData);
}

export async function makePatchRequest<TResponse, TBody = unknown>(
  endpoint: string,
  bodyData?: TBody
): Promise<AxiosResponse<TResponse>> {
  return httpClient.patch<TResponse>(endpoint, bodyData);
}

export async function makeDeleteRequest<TResponse, TBody = unknown>(
  endpoint: string,
  bodyData?: TBody
): Promise<AxiosResponse<TResponse>> {
  return httpClient.delete<TResponse>(endpoint, { data: bodyData });
}
