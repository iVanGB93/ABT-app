import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@react-navigation/native';
import 'react-native-get-random-values';

import { RootState, useAppDispatch } from "./(redux)/store";
import { setDarkTheme } from "./(redux)/settingSlice";


SplashScreen.preventAutoHideAsync();

export default function Login() {
  const {token} = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const theme = useTheme()

  useEffect(() => {
    if (theme.dark) {
        dispatch(setDarkTheme(true));
    } else {
      dispatch(setDarkTheme(false));
    }
    SplashScreen.hideAsync();
  }, []);

  return (
    token ? (
      <Redirect href={'/(businessSelect)'}/>
    ) : (
      <Redirect href={'/(auth)/login'}/>
    )
  );
};