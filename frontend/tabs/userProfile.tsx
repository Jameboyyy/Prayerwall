import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Backendless from 'backendless';
import { useNavigation } from '@react-navigation/native';
import { User } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsers, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { UserProfileNavigationProp } from '../navigationTypes'; // Ensure this import is correct

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<UserProfileNavigationProp>(); // Applying the navigation prop type

  useEffect(() => {
    const fetchCurrentUserDetails = async () => {
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
    <View style={styles.container}>
      {renderProfilePicture()}
      <Text style={styles.username}>{userProfile.userName}</Text>
      <View style={styles.nameContainer}>
        <Text style={styles.text}>{userProfile.firstName}</Text>
        <Text style={styles.text}> {userProfile.lastName}</Text>
      </View>
      <View style={styles.statsContainer}>
        <FontAwesomeIcon icon={faUserGroup} size={16} color="#4f9deb" />
        <Text style={styles.statsText}> {userProfile.userFollowing?.length || 0} Following</Text>
        <FontAwesomeIcon icon={faUsers} size={16} color="#4f9deb" />
        <Text style={styles.statsText}> {userProfile.userFollowers?.length || 0} Followers</Text>
        <Text style={styles.statsText}>Posts: {userProfile.userPosts?.length || 0}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserStackEditProfile')}>
        <Text style={styles.buttonText}>Edit Profile Details</Text>
      </TouchableOpacity>
    </View>
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
  text: {
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
    backgroundColor: '#3a506b', // Blue background
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 5, 
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff', // White text
    fontSize: 16,
  },
  nameContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    width: '100%', 
    paddingHorizontal: 20,
  },
});

export default UserProfile;
