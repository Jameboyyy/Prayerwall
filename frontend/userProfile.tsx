import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getCurrentUser } from './authService'; // Adjust the path as needed
import { CustomUser } from './userTypes'; // Adjust the path as needed

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<CustomUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  return (
    <View>
      {user ? (
        <Text>Welcome, {user.firstName}</Text>
      ) : (
        <Text>No user data available.</Text>
      )}
    </View>
  );
};

export default UserProfile;
