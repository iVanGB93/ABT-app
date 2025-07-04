import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';
import { RootState } from '../(redux)/store';

import { darkSecondColor, lightSecondColor } from '@/settings';


export default function TabLayout() {
  const token = useSelector((state:RootState) => state.auth.token);
  const {color, darkTheme, businessName} = useSelector((state:RootState) => state.settings);
  const router = useRouter()
  if (!token) {
    return <Redirect href="/" />;
  }
  if (businessName === 'Business Name') {
    return <Redirect href="(register)/initialSettings" />;
  }
  return (
    <>
    <StatusBar style={darkTheme ? 'light' : 'dark'} />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: color,
        tabBarStyle: {backgroundColor: darkTheme ? darkSecondColor : lightSecondColor},
      }}
    >
      <Tabs.Screen
        name="(clients)"
        options={{
          title: 'Clients',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(jobs)"
        options={{
          title: 'Jobs',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="id-card" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(items)"
        options={{
          title: 'Items',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="briefcase" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cogs" color={color} />,
        }}
      />
    </Tabs>
    </>
  );
}
