// MainTab.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserFeed from './userFeed';
import Search from './search';
import UserStackNavigator from '../navigation/userStack'; // Make sure the import path is correct

const Tab = createBottomTabNavigator();

const MainTab = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="UserFeed" component={UserFeed} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="UserProfile" component={UserStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default MainTab;

