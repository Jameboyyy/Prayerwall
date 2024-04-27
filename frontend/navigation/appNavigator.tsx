// NavigationSetup.ts
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Auth from '../auth/auth';
import Account from '../auth/account';
import UserFeed from '../screens/userFeed';
import Search from '../screens/search';
import Post from '../screens/post';
import Notifications from '../screens/notifications';
import Profile from '../screens/profile';
import { RootParamList, MainScreenParamList } from '../types/types';

const RootStack = createStackNavigator<RootParamList>();
const MainStack = createStackNavigator<MainScreenParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Auth">
        <RootStack.Screen name="Auth" component={Auth} />
        <RootStack.Screen name="Account" component={Account} />
      </RootStack.Navigator>
      <MainStack.Navigator>
        <MainStack.Screen name="UserFeed" component={UserFeed} />
        <MainStack.Screen name="Search" component={Search} />
        <MainStack.Screen name="Post" component={Post} />
        <MainStack.Screen name="Notifications" component={Notifications} />
        <MainStack.Screen 
            name="Profile" 
            component={Profile}
            options={({ route }) => ({ title: route.params.userId })} />
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
