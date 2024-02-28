import axios from 'axios';
import https from 'https';
export default function CreateAxiosInstance(baseURL, timeout) {
    const instance = axios.create({
        baseURL,
        timeout: timeout,
        httpsAgent: new https.Agent({ keepAlive: true }),
    });
    return instance;
}
