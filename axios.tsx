import axios from 'axios';
//import jwtDecode from 'jwt-decode';
import { baseURL } from '@/settings';
import { store } from './app/(redux)/store';
import { authLogout, setTokensAction } from './app/(redux)/authSlice';

const dispatch = (action: any) => store.dispatch(action);
let count: number = 0;

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
      dispatch(authLogout());
      return Promise.reject(error);
    }
    if (error.response.data.code === 'token_not_valid' && error.response.status === 401) {
      console.log('Getting new token...');
      console.log(count);
      const state = store.getState();
      const refreshToken = state.auth.refreshToken;
      if (refreshToken) {
        const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));
        // exp date in token is expressed in seconds, while now() returns milliseconds:
        const now = Math.ceil(Date.now() / 1000);
        if (tokenParts.exp > now) {
          if (count < 1) {
            count += 1;
            console.log('===========AFTER==============');
            console.log(count);
            return axiosInstance
              .post('/token/refresh/', { refresh: refreshToken })
              .then((response) => {
                if (response.data.access) {
                  count = 0;
                  if (response.data.refresh) {
                    dispatch(
                      setTokensAction({
                        token: response.data.access,
                        refreshToken: response.data.refresh,
                      }),
                    );
                  } else {
                    dispatch(
                      setTokensAction({ token: response.data.access, refreshToken: refreshToken }),
                    );
                  }
                  axiosInstance.defaults.headers['Authorization'] =
                    'Bearer ' + response.data.access;
                }
                return axiosInstance(originalRequest);
              })
              .catch((err) => {
                console.log(err);
                dispatch(authLogout());
                return Promise.reject(err);
              });
          } else {
            console.log('Refresh token is wrong');
            dispatch(authLogout());
            return Promise.reject(error);
          }
        } else {
          console.log('Refresh token is expired', tokenParts.exp, now);
          dispatch(authLogout());
          return Promise.reject(error);
        }
      } else {
        console.log('Refresh token not available.');
        dispatch(authLogout());
        return Promise.reject(error);
      }
    }
    console.log('ELSE', error.response.data.code, error.response.status, error.response.statusText);
    // specific error handling done elsewhere
    return Promise.reject(error);
  },
);

export default axiosInstance;
