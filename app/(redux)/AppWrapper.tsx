import React, { useEffect } from 'react';
import { Stack, Slot } from 'expo-router';
import { useAppDispatch, RootState, persistor, store } from './store';
import { useRouter } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSelector } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';


interface AppWrapperProps {
    children: React.ReactNode;
}
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
    const [loaded] = useFonts({
        SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    });
    const colorScheme = useColorScheme();
    const dispatch = useAppDispatch();
    const token = useSelector((state: RootState) => state.auth.token);
    const isRestored = useSelector((state: RootState) => state._persist.rehydrated);

    if (!loaded) {
        return null;
    };
    if (!isRestored) {
        console.log('====================================');
        console.log("RESTORED?", isRestored);
        console.log('====================================');
        return null;
    }

    useEffect(() => {
        if (isRestored && token) {
            SplashScreen.hideAsync();
        }
    }, [isRestored, token]);

    return(
        isRestored ?
        <>{children}</>
        :
        null
    );
};

export default AppWrapper;