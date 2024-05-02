import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NavigationProp } from '@react-navigation/native'; // Import StackNavigationProp

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    username: string;
    userId: string;
    likes: number; // Assuming each post document has a 'likes' field
}

interface Props {
    navigation: NavigationProp<any>;
}

const UserFeed: React.FC<Props> = ({ navigation }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const firestore = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        const postsQuery = query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
            const postsFetchPromises = querySnapshot.docs.map(async (docSnapshot) => {
                const postData = docSnapshot.data();
                const userRef = doc(firestore, "users", postData.userId);
                const userSnap = await getDoc(userRef);
                const username = userSnap.exists() ? userSnap.data().username : "Unknown User";

                return {
                    id: docSnapshot.id,
                    title: postData.title,
                    content: postData.content,
                    createdAt: postData.createdAt.toDate().toString(),
                    username: username,
                    userId: postData.userId,
                    likes: postData.likes || 0  // Default to 0 if no likes are present
                };
            });
            Promise.all(postsFetchPromises).then(setPosts);
        });

        return () => unsubscribe();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    const handleLike = async (postId: string, currentLikes: number) => {
        const postRef = doc(firestore, "posts", postId);
        await updateDoc(postRef, {
            likes: currentLikes + 1
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {posts.map((post) => (
                    <View key={post.id} style={styles.post}>
                        <Text style={styles.username}>{post.username}</Text>
                        <Text style={styles.postTitle}>{post.title}</Text>
                        <Text>{post.content}</Text>
                        <Text style={styles.postDate}>{post.createdAt}</Text>
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post.id, post.likes)}>
                                <FontAwesome5 name="pray" size={20} color="black" />
                                <Text>{` ${post.likes}`}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Comments', { postId: post.id })}>
                                <FontAwesome5 name="comment" size={20} color="black" />
                                <Text> Comment</Text>
                            </TouchableOpacity>
                        </View>
                        {auth.currentUser?.uid === post.userId && (
                            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditPost', { postId: post.id })}>
                                <FontAwesome5 name="edit" size={20} color="black" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e7d6',
    },
    scrollContainer: {
        alignItems: 'center'
    },
    post: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%',
    },
    username: {
        fontWeight: 'bold',
        color: '#3a506b'
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    postDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10
    },
    editButton: {
        padding: 5,
        position: 'absolute',
        right: 10,
        top: '85%',
    }
});

export default UserFeed;
