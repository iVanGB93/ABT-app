import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Alert } from 'react-native';
import { baseURL } from '@/settings';
import { Redirect, useRouter } from 'expo-router';
import { store, useAppDispatch } from './app/(redux)/store';
import { setTokensAction } from './app/(redux)/authSlice';

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
		const router = useRouter();
		const dispatch = useAppDispatch();
		if ( error.response.status === 401 && originalRequest.url === baseURL + 'token/refresh/') {
			console.log("Refresh token not valid...");
			//redirect here
			router.push('/');
			return Promise.reject(error);
		}
		if (error.response.data.code === 'token_not_valid' && error.response.status === 401) {
			console.log("Getting new token...");
			const state = store.getState();
			const refreshToken = state.auth.refreshToken;
			if (refreshToken) {
				const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));
				// exp date in token is expressed in seconds, while now() returns milliseconds:
				const now = Math.ceil(Date.now() / 1000);
				if (tokenParts.exp > now) {
					return axiosInstance
						.post('/token/refresh/', { refresh: refreshToken })
						.then((response) => {
							if (response.data.access && response.data.refresh) {
								dispatch(setTokensAction({token: response.data.access, refreshToken: response.data.refresh}))
								axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access;
							};
							return axiosInstance(originalRequest);
						})
						.catch((err) => {
							console.log(err);
						});
				} else {
					console.log('Refresh token is expired', tokenParts.exp, now);
					//redirect here
					router.push('/');
				}
			} else {
				console.log('Refresh token not available.');
				//redirect here
				router.push('/');
			}
		}
		console.log("ELSE", error.response.data.code, error.response.status, error.response.statusText);
		// specific error handling done elsewhere
		return Promise.reject(error);
	}
);

export default axiosInstance;