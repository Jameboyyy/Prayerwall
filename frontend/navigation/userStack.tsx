import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserProfile from '../tabs/userProfile';
import EditProfile from '../screens/editProfile';

const Stack = createNativeStackNavigator();

const UserStack = () => {
  return (
    <Stack.Navigator initialRouteName="UserStackUserProfile">
      <Stack.Screen 
        name="UserStackUserProfile" 
        component={UserProfile} 
        options={{ title: 'User Profile' }}
      />
      <Stack.Screen 
        name="UserStackEditProfile" 
        component={EditProfile} 
        options={{ title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
};

export default UserStack;
