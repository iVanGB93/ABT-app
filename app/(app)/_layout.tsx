import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, Redirect, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../(redux)/store';
import { Vibration } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { darkSecondColor, lightSecondColor } from '@/settings';

export default function TabLayout() {
  const token = useSelector((state: RootState) => state.auth.token);
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);

  if (!token) {
    return <Redirect href="/" />;
  }
  if (!business || Object.keys(business).length === 0) {
    return <Redirect href="/(businessSelect)" />;
  }

  const vibrateTab = () => Vibration.vibrate(30);

  return (
    <>
    <StatusBar style={darkTheme ? 'light' : 'dark'} />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: color,
        tabBarStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
        },
      }}
    >
      <Tabs.Screen
        name="(clients)"
        options={{
          title: 'Clients',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="users" color={color} />,
        }}
        listeners={{
          tabPress: vibrateTab,
        }}
      />
      <Tabs.Screen
        name="(jobs)"
        options={{
          title: 'Jobs',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="id-card" color={color} />,
        }}
        listeners={{
          tabPress: vibrateTab,
        }}
      />
      <Tabs.Screen
        name="(items)"
        options={{
          title: 'Items',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="briefcase" color={color} />,
        }}
        listeners={{
          tabPress: vibrateTab,
        }}
      />
      <Tabs.Screen
        name="(business)"
        options={{
          title: 'Business',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="building" color={color} />,
        }}
        listeners={{
          tabPress: vibrateTab,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cogs" color={color} />,
        }}
        listeners={{
          tabPress: vibrateTab,
        }}
      />
    </Tabs>
    </>
  );
}
