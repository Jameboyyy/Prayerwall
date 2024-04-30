import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Auth from '../screens/auth';
import Account from '../screens/account';
import UserFeed from '../screens/userFeed';
import Search from '../screens/search';
import Post from '../screens/post';
import Notification from '../screens/notification';
import Profile from '../screens/profile';
import EditProfile from '../screens/editProfile';
import SearchedProfile from '../screens/SearchedProfile';
import GroupChat from '../screens/groupChat';
import EditPost from '../screens/editPost';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const UserFeedStack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
        <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="UserFeedTab" component={UserFeedStackScreen} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Post" component={Post} />
      <Tab.Screen name="Notification" component={Notification} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

const UserFeedStackScreen = () => {
  return (
    <UserFeedStack.Navigator>
      <UserFeedStack.Screen name="UserFeed" component={UserFeed} />
      <UserFeedStack.Screen name="EditPost" component={EditPost} />
    </UserFeedStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={Profile} />
      <ProfileStack.Screen name="EditProfile" component={EditProfile} />
    </ProfileStack.Navigator>
  );
};

export default AppNavigator;
