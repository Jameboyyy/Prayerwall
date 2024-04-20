// AppNavigator.tsx or wherever your main navigator is defined
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTab from '../tabs/mainTab';
import UserStack from '../navigation/userStack'; // Assuming UserStack is exported from UserStack.tsx

const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="MainTab" component={MainTab} options={{ headerShown: false }} />
      <RootStack.Screen name="UserStack" component={UserStack} options={{ headerShown: false }} />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
