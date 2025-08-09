import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../(redux)/store';
import { Vibration } from 'react-native';

import { darkSecondColor, lightSecondColor } from '@/settings';

export default function TabLayout() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);

  const vibrateTab = () => Vibration.vibrate(30);

  return (
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
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 28 : 26} name="users" color={color} />
          ),
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
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 28 : 26} name="id-card" color={color} />
          ),
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
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 28 : 26} name="building" color={color} />
          ),
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
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 28 : 26} name="briefcase" color={color} />
          ),
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
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 28 : 26} name="cogs" color={color} />
          ),
        }}
        listeners={{
          tabPress: vibrateTab,
        }}
      />
    </Tabs>
  );
}
