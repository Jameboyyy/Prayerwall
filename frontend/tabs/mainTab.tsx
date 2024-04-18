// MainTab.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserFeed from './userFeed';
import UserProfile from './userProfile';
import Search from './search';

const Tab = createBottomTabNavigator();

const MainTab = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="UserFeed" component={UserFeed} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="UserProfile" component={UserProfile} />
    </Tab.Navigator>
  );
};
export default MainTab;
