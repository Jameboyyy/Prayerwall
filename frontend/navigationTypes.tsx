import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigatorScreenParams } from '@react-navigation/native';

// Root stack for any top-level navigation
export type RootStackParamList = {
    Auth: undefined;
    Account: { ownerId: string };
    MainTab: NavigatorScreenParams<MainTabParamList> | undefined;
    EditProfile: undefined;  // No parameters needed for editing the profile
};

// Main tab navigator parameter list
export type MainTabParamList = {
    UserFeed: undefined;
    Search: undefined;
    UserProfile: undefined;
};

// User-specific stack parameter list
export type UserStackParamList = {
    UserStackUserProfile: undefined;
    UserStackEditProfile: undefined;
};

// Navigation prop types specific to each navigator or screen
export type MainTabNavigationProp = StackNavigationProp<MainTabParamList, 'UserProfile'>;
export type EditProfileNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

export type UserProfileNavigationProp = StackNavigationProp<UserStackParamList, 'UserStackUserProfile'>;
export type UserEditProfileNavigationProp = StackNavigationProp<UserStackParamList, 'UserStackEditProfile'>;

// Route prop for accessing route parameters in UserProfile, if any
export type UserProfileRouteProp = RouteProp<UserStackParamList, 'UserStackUserProfile'>;
