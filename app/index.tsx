import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@react-navigation/native';
import 'react-native-get-random-values';

import { RootState, useAppDispatch } from "./(redux)/store";
import { setDarkTheme } from "./(redux)/settingSlice";
import { ActivityIndicator } from "react-native";
import { commonStyles } from "@/constants/commonStyles";


SplashScreen.preventAutoHideAsync();

export default function Index() {
  const {token} = useSelector((state: RootState) => state.auth);
  const { color } = useSelector((state: RootState) => state.settings);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  useEffect(() => {
    if (theme.dark) {
      dispatch(setDarkTheme(true));
    } else {
      dispatch(setDarkTheme(false));
    }
    if (token) {
      setIsAuthenticated(true);
      SplashScreen.hideAsync();
    } else {
      setIsAuthenticated(false);
      SplashScreen.hideAsync();
    }
  }, [token]);

  if (isAuthenticated === null) {
    return <ActivityIndicator size="large" style={commonStyles.loading} color={color} />;
  };

  return (
    isAuthenticated ? (
      <Redirect href={'/(businessSelect)'}/>
    ) : (
      <Redirect href={'/(auth)/login'}/>
    )
  );
};