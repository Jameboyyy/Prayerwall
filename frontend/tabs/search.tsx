import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import Backendless from 'backendless';
import { StyleSheet } from 'react-native';
import { MainTabParamList } from '../navigationTypes';
import { User } from '../types'

const Search = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<User[]>([]);

  const handleSearch = async () => {
      const whereClause = `name LIKE '%${query}%'`;
      const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
      try {
          const foundUsers = await Backendless.Data.of("Users").find<User>(queryBuilder);
          setResults(foundUsers);
      } catch (error) {
          console.error('Search failed:', error);
      }
  };

  const handleAddFriend = async (userId: string) => {
      try {
          console.log('Friend added successfully!', userId);
      } catch (error) {
          console.error('Adding friend failed:', error);
      }
  };

  return (
      <View style={styles.container}>
          <TextInput
              placeholder="Search users..."
              autoCapitalize='none'
              value={query}
              onChangeText={setQuery}
              style={styles.input}
          />
          <Button title="Search" onPress={handleSearch} />

          <FlatList
              data={results}
              keyExtractor={(item) => item.objectId}
              renderItem={({ item }) => (
                  <View style={styles.itemContainer}>
                      <Text>{item.userName}</Text>
                      <TouchableOpacity onPress={() => handleAddFriend(item.objectId)}>
                          <Text>Add Friend</Text>
                      </TouchableOpacity>
                  </View>
              )}
          />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 10,
  },
  input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 20,
  },
  itemContainer: {
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
});

export default Search;
