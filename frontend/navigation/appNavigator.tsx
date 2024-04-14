import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTab from '../tabs/mainTab'; // Correct the path as necessary

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="MainTab">
      <Stack.Screen name="MainTab" component={MainTab} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
