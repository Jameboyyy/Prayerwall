import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

// Define the types for better code management
type UserProfile = {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    following: number;
    followers: number;
    posts: number;
};

type Post = {
    id: string;
    title: string;
    content: string;
    createdAt: string; // Using string for simplicity in display
    userId: string;
};

const Profile = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const auth = getAuth();
    const firestore = getFirestore();
    const navigation = useNavigation();

    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                const userDocRef = doc(firestore, "users", userId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUser(userDoc.data() as UserProfile);
                }
            }
        };

        const fetchPosts = async () => {
            if (userId) {
                const postsQuery = query(collection(firestore, "posts"), where("userId", "==", userId), orderBy("createdAt", "desc"));
                const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
                    const postsData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt.toDate().toLocaleDateString()
                    })) as Post[];
                    setPosts(postsData);
                });
                return unsubscribe;
            }
        };

        fetchUserData();
        const unsubscribeFromPosts = fetchPosts();

        return () => {
            unsubscribeFromPosts && unsubscribeFromPosts();
        };
    }, [userId]);

    const onRefresh = () => {
        setRefreshing(true);
        Promise.all([fetchUserData()]).then(() => {
            setRefreshing(false);
        });
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {user && (
                <>
                    {user.profilePicture ? (
                        <Image source={{ uri: user.profilePicture }} style={styles.profilePic} />
                    ) : (
                        <Text>No Profile Picture</Text>
                    )}
                    <Text style={styles.username}>{user.username}</Text>
                    <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
                    <View style={styles.statsContainer}>
                        <Text style={styles.stat}>{`Following: ${user.following}`}</Text>
                        <Text style={styles.stat}>{`Followers: ${user.followers}`}</Text>
                        <Text style={styles.stat}>{`Posts: ${user.posts}`}</Text>
                    </View>
                </>
            )}
            {posts.map(post => (
                <View key={post.id} style={styles.postContainer}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text>{post.content}</Text>
                    <Text style={styles.postDate}>{post.createdAt}</Text>
                    {userId === post.userId && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate('EditPost', { postId: post.id })}
                        >
                            <FontAwesome5 name="edit" size={20} color="#000" />
                        </TouchableOpacity>
                    )}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    name: {
        fontSize: 16,
        marginBottom: 5
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 10
    },
    stat: {
        fontSize: 14
    },
    postContainer: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    postTitle: {
        fontWeight: 'bold',
        fontSize: 16
    },
    postDate: {
        fontSize: 12,
        marginBottom: 5
    },
    editButton: {
        padding: 5,
        alignSelf: 'flex-end'
    }
});

export default Profile;
