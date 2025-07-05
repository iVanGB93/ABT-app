import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Redirect, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@react-navigation/native';

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
    console.log('first index', token);
  }, []);

  return (
    token ? (
      <Redirect href={'/(app)/(business)/businesses'}/>
    ) : (
      <Redirect href={'/(auth)/login'}/>
    )
  );
};