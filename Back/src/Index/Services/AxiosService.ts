import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import https from 'https'

export default function CreateAxiosInstance(baseURL: string, timeout: number): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: timeout,
    httpsAgent: new https.Agent({ keepAlive: true }),
  });
  return instance;
}
