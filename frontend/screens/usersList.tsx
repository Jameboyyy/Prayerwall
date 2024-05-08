import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const UsersList = ({ users }) => {
  const navigation = useNavigation();

  const handleSelectUser = (userId) => {

    navigation.navigate('GroupChat', { userId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelectUser(item.id)} style={styles.userItem}>
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

const styles = StyleSheet.create({
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  username: {
    fontSize: 18
  }
});

export default UsersList;
