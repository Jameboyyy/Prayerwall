import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NavigationProp } from '@react-navigation/native';

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    username: string;
    userId: string;
    likes: number;
    currentUserLiked: boolean;
}

interface Props {
    navigation: NavigationProp<any>;
}

const UserFeed: React.FC<Props> = ({ navigation }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const firestore = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        const postsQuery = query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(postsQuery, async (querySnapshot) => {
            const postsData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
                const postData = docSnapshot.data();
                const userRef = doc(firestore, "users", postData.userId); // Reference to the user document
                const userSnapshot = await getDoc(userRef); // Fetch the user document
                const user = userSnapshot.data(); // Extract user data
                const username = user ? user.username : "Unknown"; // Get username or set a default
    
                const likesRef = doc(collection(firestore, "posts", docSnapshot.id, "likes"), currentUser?.uid);
                const likesSnapshot = await getDoc(likesRef);
                const currentUserLiked = likesSnapshot.exists();
    
                return {
                    id: docSnapshot.id,
                    title: postData.title,
                    content: postData.content,
                    createdAt: postData.createdAt.toDate().toString(),
                    username: username, // Set the username
                    userId: postData.userId,
                    likes: postData.likes || 0,
                    currentUserLiked
                };
            }));
            setPosts(postsData);
        });
    
        return () => unsubscribe();
    }, [currentUser]);
    
    

    const handleLike = async (post: Post) => {
        const postRef = doc(firestore, "posts", post.id);
        const likesRef = doc(collection(firestore, "posts", post.id, "likes"), currentUser?.uid);

        if (post.currentUserLiked) {
            await deleteDoc(likesRef);
            await updateDoc(postRef, {
                likes: post.likes - 1
            });
        } else {
            await setDoc(likesRef, { userId: currentUser?.uid });
            await updateDoc(postRef, {
                likes: post.likes + 1
            });
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
            >
                {posts.map((post) => (
                    <View key={post.id} style={styles.post}>
                        <Text style={styles.username}>{post.username}</Text>
                        <Text style={styles.postTitle}>{post.title}</Text>
                        <Text>{post.content}</Text>
                        <Text style={styles.postDate}>{post.createdAt}</Text>
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post)}>
                                <FontAwesome5 name="pray" size={20} color={post.currentUserLiked ? "#3a506b" : "black"} />
                                <Text>{` ${post.likes}`}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Comment', { postId: post.id })}>
                                <FontAwesome5 name="comment" size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                        {currentUser?.uid === post.userId && (
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
        justifyContent: 'flex-start', // Align items to the start of the container
        marginTop: 10,
        marginBottom: 10
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20 // Increase or decrease as needed to manage space between buttons
    },    
    editButton: {
        padding: 5,
        position: 'absolute',
        right: 10,
        top: '85%',
    }
});

export default UserFeed;
