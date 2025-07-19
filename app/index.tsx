import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@react-navigation/native';
import 'react-native-get-random-values';

import { RootState, useAppDispatch } from "./(redux)/store";
import { setDarkTheme } from "./(redux)/settingSlice";
import axiosInstance from '@/axios';
import { ActivityIndicator } from "react-native";


SplashScreen.preventAutoHideAsync();

export default function Login() {
  const {token, userName} = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const theme = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (theme.dark) {
      dispatch(setDarkTheme(true));
    } else {
      dispatch(setDarkTheme(false));
    }

    const verifyAuth = async () => {
      if (!token) {
        setIsAuthenticated(false);
        SplashScreen.hideAsync();
        return;
      }
      try {
        await axiosInstance.get(`business/${userName ? userName : 'TestingLogin'}/`);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        SplashScreen.hideAsync();
      }
    };
    verifyAuth();
  }, [token]);

  if (isAuthenticated === null) {
    return <ActivityIndicator size="large" color={theme.colors.primary} />;
  }

  return (
    isAuthenticated ? (
      <Redirect href={'/(businessSelect)'}/>
    ) : (
      <Redirect href={'/(auth)/login'}/>
    )
  );
};