import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
import UsersList from '../screens/usersList';

const AuthContext = React.createContext(null);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const UserFeedStack = createStackNavigator();
const SearchStack = createStackNavigator();

const AppNavigator = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe; // Cleanup on unmount
  }, []);

  return (
    <AuthContext.Provider value={currentUser}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Auth">
          <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
          <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

const MainTabNavigator = () => {
  const currentUser = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide the header for all tabs
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'UserFeed') {
            iconName = 'home';
          } else if (route.name === 'SearchTab') {
            iconName = 'search';
          } else if (route.name === 'PostTab') {
            iconName = 'plus-square';
          } else if (route.name === 'NotificationTab') {
            iconName = 'bell';
          } else if (route.name === 'ProfileTab') {
            iconName = 'user';
          }

          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3a506b',
        tabBarInactiveTintColor: '#36454f',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#d2e7d6',
        },
      })}
    >
      <Tab.Screen name="UserFeed" component={UserFeedStackScreen} />
      <Tab.Screen name="SearchTab" component={SearchStackScreen} />
      <Tab.Screen name="PostTab" component={Post} />
      <Tab.Screen name="NotificationTab" children={() => <Notification currentUser={currentUser} />} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

const UserFeedStackScreen = () => {
  return (
    <UserFeedStack.Navigator>
      <UserFeedStack.Screen name="UserFeedMain" component={UserFeed} options={{ headerShown: false }}/>
      <UserFeedStack.Screen name="EditUserPost" component={EditPost} options={{ headerShown: false }} />
      <UserFeedStack.Screen name="UsersList" component={UsersList} options={{ headerShown: true, title: 'Group Chat' }} />
      <UserFeedStack.Screen 
        name="UserComments" 
        component={Comment} 
        options={({ route }) => ({ 
          title: 'Comment',
          headerBackTitleVisible: false,
          headerShown: true,
          headerTintColor: '#333',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      /> 
    </UserFeedStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="UserProfile" component={Profile} />
      <ProfileStack.Screen name="EditProfile" component={EditProfile} />
    </ProfileStack.Navigator>
  );
};

const SearchStackScreen = () => {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="SearchMain" component={Search} />
      <SearchStack.Screen name="SearchUserProfile" component={SearchedProfile} />
    </SearchStack.Navigator>
  );
};



export default AppNavigator;
