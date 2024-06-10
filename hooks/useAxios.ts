import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import { baseURL } from '@/settings';


const useAxios = () => {
    const router = useRouter()

    const axiosInstance = axios.create({
        baseURL: baseURL,
        timeout: 5000,
    });

    axiosInstance.interceptors.request.use(
        async function (config) {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                }
            }
            catch (e) {
                console.log("no token saved", e);
            }
            return config;
        }, function (error) {
            // Do something with request error
        return Promise.reject(error);
    });

    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        async function (error) {
            const originalRequest = error.config;
            if (typeof error.response === 'undefined') {
                Alert.alert(
                    'A server/network error occurred. ' +
                    'Sorry about this - we will get it fixed shortly.'
                );
                return Promise.reject(error);
            }
            if ( error.response.status === 401 && originalRequest.url === baseURL + 'token/refresh/') {
                console.log("Refresh token not valid...");
                //redirect here
                router.push('/');
                return Promise.reject(error);
            }
            /* if (error.response.data.code === 'token_not_valid' && error.response.status === 401) {
                console.log("Getting new token...");
                //redirect here
                console.log(error.response.data.code);
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                    const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));
                    // exp date in token is expressed in seconds, while now() returns milliseconds:
                    const now = Math.ceil(Date.now() / 1000);
                    if (tokenParts.exp > now) {
                        return axiosInstance
                            .post('/token/refresh/', { refresh: refreshToken })
                            .then((response) => {
                                if (response.data.access) {
                                    AsyncStorage.setItem('token', JSON.stringify(response.data.access));
                                    AsyncStorage.setItem('refreshToken', JSON.stringify(response.data.refresh));
                                    axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access;
                                } else {
                                    //redirect here
                                };
                                return axiosInstance(originalRequest);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    } else {
                        console.log('Refresh token is expired', tokenParts.exp, now);
                        //redirect here
                    }
                } else {
                    console.log('Refresh token not available.');
                    //redirect here
                }
            } */
            console.log("ELSE", error.response.data.code, error.response.status, error.response.statusText);
            // specific error handling done elsewhere
            return Promise.reject(error);
        }
    );

    return axiosInstance
};

export default useAxios;