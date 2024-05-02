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
import SearchedProfile from '../screens/searchedProfile';
import GroupChat from '../screens/groupChat';
import EditPost from '../screens/editPost';
import Comment from '../screens/comment';  // Import Comment component

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const UserFeedStack = createStackNavigator();
const SearchStack = createStackNavigator();

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
      <Tab.Screen name="UserFeedTab" component={UserFeedStackScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="SearchTab" component={SearchStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="PostTab" component={Post} options={{ headerShown: false }} />
      <Tab.Screen name="NotificationTab" component={Notification} options={{ headerShown: false }}/>
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const UserFeedStackScreen = () => {
  return (
    <UserFeedStack.Navigator>
      <UserFeedStack.Screen name="UserFeed" component={UserFeed} />
      <UserFeedStack.Screen name="EditPost" component={EditPost} />
      <UserFeedStack.Screen name="Comment" component={Comment} /> 
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

const SearchStackScreen = () => {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="SearchMain" component={Search} />
      <SearchStack.Screen name="SearchedProfile" component={SearchedProfile} />
    </SearchStack.Navigator>
  );
};

export default AppNavigator;
