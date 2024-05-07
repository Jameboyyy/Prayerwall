import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

interface User {
  id: string;
  username: string;
}

const Search = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [debouncedText, setDebouncedText] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (debouncedText.trim() !== '') {
                searchUsers(debouncedText);
            }
        }, 300); // Delay search to reduce the number of requests

        return () => {
            clearTimeout(handler);
        };
    }, [debouncedText]);

    const searchUsers = async (text: string) => {
        const q = query(collection(firestore, "users"), where("username", ">=", text), where("username", "<=", text + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        const results: User[] = [];
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...(doc.data() as User) });
        });
        setUsers(results);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search users"
                value={searchText}
                onChangeText={text => {
                    setSearchText(text);
                    setDebouncedText(text);
                }} // Update the debounced text when the user types
                autoCapitalize='none'
            />
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('SearchUserProfile', { userId: item.id })} style={styles.userItemContainer}>
                        <Text style={styles.userItem}>{item.username}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#d2e7d6',
    },
    input: {
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
        fontFamily: 'JosefinSans-Regular',
        color: '#3a506b',
    },
    userItemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 5,
    },
    userItem: {
        fontFamily: 'JosefinSans-Regular',
        color: '#3a506b',
        fontSize: 16,
    }
});

export default Search;

