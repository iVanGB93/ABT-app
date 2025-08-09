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
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import axiosInstance from '@/axios';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const {token, userName} = useSelector((state: RootState) => state.auth);
  const { color } = useSelector((state: RootState) => state.settings);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      dispatch(setDarkTheme(!!theme.dark));

      if (!token || !userName) {
        if (!isMounted) return;
        setIsAuthenticated(false);
        await SplashScreen.hideAsync();
        return;
      }

      try {
        await axiosInstance.get(`user/account/${userName}/`);
        if (!isMounted) return;
        setIsAuthenticated(true);
      } catch {
        if (!isMounted) return;
        setIsAuthenticated(false);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [token, userName, theme.dark]);

  if (isAuthenticated === null) {
    return (
      <ThemedView style={commonStyles.containerCentered}> 
        <ActivityIndicator size="large" style={commonStyles.loading} color={color} />
        <ThemedText style={commonStyles.loading} type="subtitle">Authenticating...</ThemedText>
      </ThemedView>
    );
  };

  return (
    isAuthenticated ? (
      <Redirect href={'/(app)/(business)'}/>
    ) : (
      <Redirect href={'/(auth)/login'}/>
    )
  );
};