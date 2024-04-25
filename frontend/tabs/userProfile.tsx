import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, Image, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import Backendless from 'backendless';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsers, faUserGroup, faEdit } from '@fortawesome/free-solid-svg-icons';
import { User, CustomPost } from '../types';
import { UserProfileNavigationProp } from '../navigationTypes';

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<CustomPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<UserProfileNavigationProp>();

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await Backendless.UserService.getCurrentUser();
      if (!currentUser || !currentUser.objectId) {
        Alert.alert('Error', 'No user is currently logged in or user ID is missing');
        setLoading(false);
        return;
      }
      const queryBuilder = Backendless.DataQueryBuilder.create();
      queryBuilder.setRelated(["userPosts", "userFollowing", "userFollowers"]);
      queryBuilder.setSortBy(["userPosts.created DESC"]); // Sorting posts by creation date
      const user = await Backendless.Data.of("Users").findById<User>(currentUser.objectId, queryBuilder);
      if (!user) {
        throw new Error('User not found');
      }
      console.log('Fetched user with posts:', user);
      setUserProfile(user);
      setUserPosts(user.userPosts || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to fetch user details. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  const renderProfilePicture = () => {
    return userProfile?.profilePicture ? 
      <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} /> :
      <Image source={{ uri: 'https://res.cloudinary.com/dwey7oaba/image/upload/v1713607870/Default_Picture_ylyjcn.png' }} style={styles.profileImage} />;
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!userProfile) {
    return (
      <View style={styles.centeredContainer}>
        <Text>No user profile found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderProfilePicture()}
      <Text style={styles.username}>{userProfile.userName}</Text>
      <View style={styles.nameContainer}>
        <Text style={styles.fullName}>{userProfile.firstName} {userProfile.lastName}</Text>
      </View>
      <View style={styles.statsContainer}>
        <FontAwesomeIcon icon={faUserGroup} size={16} color="#4f9deb" />
        <Text style={styles.statsText}>{userProfile.userFollowing?.length || 0} Following</Text>
        <FontAwesomeIcon icon={faUsers} size={16} color="#4f9deb" />
        <Text style={styles.statsText}>{userProfile.userFollowers?.length || 0} Followers</Text>
        <Text style={styles.statsText}>Posts: {userPosts.length}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserStackEditProfile')}>
        <FontAwesomeIcon icon={faEdit} size={24} color="white" />
        <Text style={styles.buttonText}>Edit Profile Details</Text>
      </TouchableOpacity>
      {userPosts.map((post, index) => (
        <View key={index} style={styles.postContainer}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          <Text style={styles.postDate}>{new Date(post.created).toLocaleDateString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: '#d2e7d6',
  },
  centeredContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  profileImage: {
    width: 100, 
    height: 100, 
    borderRadius: 50,
  },
  username: {
    fontSize: 18, 
    fontWeight: 'bold', 
    marginVertical: 10,
  },
  fullName: {
    fontSize: 16, 
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '80%', 
    marginTop: 20, 
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3a506b', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 5, 
    marginTop: 20,
    flexDirection: 'row', 
    alignItems: 'center'
  },
  buttonText: {
    color: '#ffffff', 
    fontSize: 16,
    marginLeft: 10
  },
  nameContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    width: '100%', 
    paddingHorizontal: 20,
  },
  postContainer: {
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  postDate: {
    fontSize: 14,
    color: '#666',
  },
  postContent: {
    fontSize: 14,
    marginTop: 5,
  }
});

export default UserProfile;