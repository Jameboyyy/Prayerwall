import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHandsPraying, faComment, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CustomPost, User } from '../types';

// Define an interface representing the structure of the data returned by the Backendless API
interface PostWithUser extends CustomPost {
    // Define the structure of the user object
    users: {
        userName: string; 
    }[]
}

const UserFeed = () => {
    const [posts, setPosts] = useState<PostWithUser[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setRefreshing(true);
        try {
            const response = await fetch('https://turgentloaf.backendless.app/api/data/Posts');
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const postData: CustomPost[] = await response.json();
            const postsWithUsers: PostWithUser[] = [];
    
            for (const post of postData) {
                const userResponse = await fetch(`https://turgentloaf.backendless.app/api/data/Users/${post.ownerId}`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user');
                }
                const userData: User = await userResponse.json();
    
                postsWithUsers.push({
                    ...post,
                    users: [{ userName: userData.userName }]
                });
            }
    
            setPosts(postsWithUsers);
        } catch (error) {
            console.error('Fetch posts error:', error);
            setPosts([]);
        }
        setRefreshing(false);
    };

    const onRefresh = () => {
        fetchPosts();
    };

    const renderPostItem = ({ item }: { item: PostWithUser }) => (
        <View style={styles.postContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.username}>Posted by: {item.users && item.users.length > 0 ? item.users[0].userName : 'Unknown'}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <FontAwesomeIcon icon={faHandsPraying} size={24} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <FontAwesomeIcon icon={faComment} size={24} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <FontAwesomeIcon icon={faPlus} size={24} color="#007bff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderPostItem}
                keyExtractor={item => item.objectId} // Ensure the key extractor uses the objectId field
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e7d6',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    postContainer: {
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    content: {
        fontSize: 16,
        marginBottom: 5,
    },
    username: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
        padding: 5,
        borderRadius: 3,
    },
});

export default UserFeed;
