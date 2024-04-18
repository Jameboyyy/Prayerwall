import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import Backendless from 'backendless';

interface User {
  objectId: string;
  firstName: string;
  lastName: string;
  userName: string;
  Posts: any[]; // Adjust this type based on your actual data structure
  Followers: any[]; // Adjust this type based on your actual data structure
}

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUserDetails = async () => {
      setLoading(true);
      try {
        const currentUser = await Backendless.UserService.getCurrentUser();
        if (!currentUser || !currentUser.objectId) {
          throw new Error('No user is currently logged in or user ID is missing');
        }
        const queryBuilder = Backendless.DataQueryBuilder.create();
        queryBuilder.setRelated(["userPosts", "userFollowing", "userFollowers"]);
        const user = await Backendless.Data.of("Users").findById<User>(currentUser.objectId, queryBuilder);
        setUserProfile(user);
      } catch (error) {
        console.error('Error fetching user details:', error);
        Alert.alert('Error', 'Failed to fetch user details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    

    fetchCurrentUserDetails();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!userProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No user profile found.</Text>
      </View>
    );
  }

  const hasPosts = userProfile.Posts && userProfile.Posts.length > 0;
  const hasFollowers = userProfile.Followers && userProfile.Followers.length > 0;

  return (
    <View>
      <Text>First Name: {userProfile.firstName}</Text>
      <Text>Last Name: {userProfile.lastName}</Text>
      <Text>Username: {userProfile.userName}</Text>
      <Text>Posts: {hasPosts ? userProfile.Posts.length : '0'}</Text>
    <Text>Followers: {hasFollowers ? userProfile.Followers.length : '0'}</Text>
    </View>
  );
};

export default UserProfile;
