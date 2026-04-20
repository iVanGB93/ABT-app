import axios from 'axios';
//import jwtDecode from 'jwt-decode';
import { baseURL } from '@/settings';
import { store } from './app/(redux)/store';
import { authLogout, setTokensAction } from './app/(redux)/authSlice';
import { cleanSettings, setError } from './app/(redux)/settingSlice';

const dispatch = (action: any) => store.dispatch(action);

// Track in-flight token refresh to avoid parallel refresh calls
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const onTokenRefreshed = (token: string) => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
  async function (config) {
    try {
      const state = store.getState();
      const token = state.auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('no token saved', e);
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async function (error) {
    const originalRequest = error.config;
    if (typeof error.response === 'undefined') {
      return Promise.reject(error);
    }
    if (error.response.status === 401 && originalRequest.url === baseURL + 'token/refresh/') {
      console.log('Refresh token not valid...');
      isRefreshing = false;
      pendingRequests = [];
      dispatch(authLogout());
      dispatch(cleanSettings());
      dispatch(setError('Session expired, please login again!'));
      return Promise.reject(error);
    }
    if (error.response.data.code === 'token_not_valid' && error.response.status === 401) {
      // Avoid re-entering refresh if this request is already a retry
      if (originalRequest._retry) {
        dispatch(authLogout());
        dispatch(cleanSettings());
        dispatch(setError('Session expired, please login again!'));
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;
      if (refreshToken) {
        const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));
        const now = Math.ceil(Date.now() / 1000);
        if (tokenParts.exp > now) {
          if (isRefreshing) {
            // Queue requests until the refresh completes
            return new Promise((resolve) => {
              pendingRequests.push((newToken: string) => {
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                resolve(axiosInstance(originalRequest));
              });
            });
          }

          isRefreshing = true;
          return axiosInstance
            .post('/token/refresh/', { refresh: refreshToken })
            .then((response) => {
              if (response.data.access) {
                const newToken = response.data.access;
                const newRefresh = response.data.refresh ?? refreshToken;
                dispatch(setTokensAction({ token: newToken, refreshToken: newRefresh }));
                axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + newToken;
                onTokenRefreshed(newToken);
                isRefreshing = false;
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              isRefreshing = false;
              pendingRequests = [];
              dispatch(authLogout());
              dispatch(cleanSettings());
              dispatch(setError('Session expired, please login again!'));
              return Promise.reject(err);
            });
        } else {
          dispatch(authLogout());
          dispatch(cleanSettings());
          dispatch(setError('Session expired, please login again!'));
          return Promise.reject(error);
        }
      } else {
        dispatch(authLogout());
        dispatch(cleanSettings());
        dispatch(setError('Session expired, please login again!'));
        return Promise.reject(error);
      }
    }
    // specific error handling done elsewhere
    return Promise.reject(error);
  },
);

export default axiosInstance;
