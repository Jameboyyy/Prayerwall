import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Auth from './auth/auth';
import Account from './auth/account';
import UserFeed from './screens/userFeed';
import * as Font from 'expo-font';
import { RootParamList } from './types/types';
import { MainScreenParamList } from './types/types';

const RootStack = createStackNavigator<RootParamList>();
const MainTab = createBottomTabNavigator<MainScreenParamList>();

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'JosefinSans-Regular': require('./fonts/JosefinSans-Regular.ttf'),
        'JosefinSans-Italic': require('./fonts/JosefinSans-Italic.ttf'),
        'JosefinSans-Bold': require('./fonts/JosefinSans-Bold.ttf'),
      });
      setFontsLoaded(true);
    };
    
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Or some loading component
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
        <RootStack.Screen name="Account" component={Account} options={{ headerShown: false }} />
        <MainTab.Screen name="UserFeed" component={UserFeed} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default App;
