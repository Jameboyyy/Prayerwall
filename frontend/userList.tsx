import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Backendless from 'backendless';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define the user type structure
interface User {
  objectId: string;
  userName: string;  // Change from name to userName
}

// Define the navigation props if you have a specific navigation structure
// For example, if UserProfile is part of a stack navigator
type RootStackParamList = {
  UserProfile: { userId: string };
};

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);  // Users now expected to have a userName
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Typing the navigation prop

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const queryBuilder = Backendless.DataQueryBuilder.create();
        // Assuming userName is indexed and you have set up case insensitive search
        queryBuilder.setWhereClause("userName != ''"); // Adjust the clause as needed for your app's logic
        const usersFetched = await Backendless.Data.of('Users').find(queryBuilder);
        setUsers(usersFetched as User[]); // Type assertion to User[]
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <FlatList
      data={users}
      keyExtractor={item => item.objectId}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('UserProfile', { userId: item.objectId })}
        >
          <Text>{item.userName}</Text> // Displaying userName
        </TouchableOpacity>
      )}
    />
  );
};

export default UserList;
