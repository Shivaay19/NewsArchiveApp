// App.js
import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = route.name === 'News' ? 'newspaper' : 'list';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: scheme === 'dark' ? '#121212' : '#fff',
          },
          tabBarActiveTintColor: scheme === 'dark' ? '#fff' : '#000',
        })}
      >
        <Tab.Screen name="News" component={HomeScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
