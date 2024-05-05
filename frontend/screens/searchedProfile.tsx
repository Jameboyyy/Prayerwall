import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, FlatList, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { doc, getDoc, collection, query, where, getDocs, orderBy, runTransaction, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NavigationProp, RouteProp } from '@react-navigation/native';

interface User {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
}

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    userId: string;
    likes: string[];
    currentUserLiked: boolean;
    subpost?: {
        content: string;
        createdAt: Date;
    };
    comments: CommentType[];
    newCommentText: string;
}

interface CommentType {
    id: string;
    text: string;
    username: string;
    createdAt: Date;
}

interface Props {
    route: RouteProp<{ params: { userId: string }}, 'params'>;
    navigation: NavigationProp<any>;

}

const SearchedProfile = ({ route, navigation }: Props) => {
    const [user, setUser] = useState<User>({
        username: '',
        firstName: '',
        lastName: '',
        profilePicture: null
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const { userId } = route.params;

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        await fetchUserData();
        await fetchUserPosts();
    };

    const fetchUserData = async () => {
        const userRef = doc(firestore, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            setUser(userSnap.data() as User);
        } else {
            console.log("No user data available");
        }
    };


    const fetchUserPosts = async () => {
        const postsQuery = query(collection(firestore, "posts"), where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(postsQuery);
        const userPosts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                content: data.content,
                createdAt: data.createdAt.toDate().toLocaleDateString(),
                userId: data.userId,
                likes: data.likes || [], // Make sure likes is always an array
                currentUserLiked: Array.isArray(data.likes) ? data.likes.includes(currentUser?.uid) : false,
                subpost: data.subpost ? {
                    content: data.subpost.content,
                    createdAt: new Date(data.subpost.createdAt.seconds * 1000)
                } : undefined,
                comments: [],
                newCommentText: '', // Add a newCommentText field for adding comments
            };
        });
        setPosts(userPosts);
    };
    const handleLike = async (post: Post) => {
        const postRef = doc(firestore, "posts", post.id);
        const likesRef = collection(firestore, "posts", post.id, "likes");
        const userLikeRef = doc(likesRef, currentUser?.uid);
        
        try {
            await runTransaction(firestore, async (transaction) => {
                const userLikeSnap = await transaction.get(userLikeRef);
                const postSnap = await transaction.get(postRef);
                const postData = postSnap.data();
    
                // Ensure postLikes is initialized as an empty array
                let postLikes: string[] = postData?.likes || [];
    
                if (userLikeSnap.exists()) {
                    // User already liked, so unlike
                    transaction.delete(userLikeRef);
                    postLikes = postLikes.filter((userId: string) => userId !== currentUser?.uid);
                } else {
                    // User hasn't liked, so like
                    transaction.set(userLikeRef, { likedAt: new Date() });
                    if (currentUser?.uid) { // Check if currentUser?.uid is not undefined
                        postLikes.push(currentUser.uid); // Push currentUser?.uid into postLikes
                    } else {
                        console.error("Current user ID is undefined");
                    }
                }
    
                transaction.update(postRef, { likes: postLikes });
    
                // Update the local state to reflect the changes
                const updatedPosts = posts.map((p) => {
                    if (p.id === post.id) {
                        return {
                            ...p,
                            likes: postLikes,
                            currentUserLiked: postLikes.includes(currentUser?.uid)
                        };
                    }
                    return p;
                });
    
                setPosts(updatedPosts);
            });
        } catch (error) {
            console.error("Transaction failed: ", error);
        }
    };
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    return (
        <FlatList
            data={posts}
            keyExtractor={item => item.id}
            ListHeaderComponent={() => (
                <View style={styles.header}>
                    {user.profilePicture ? (
                        <Image source={{ uri: user.profilePicture }} style={styles.profilePic} />
                    ) : (
                        <FontAwesome5 name="user-circle" size={100} color="#ccc" />
                    )}
                    <Text style={styles.username}>{user.username}</Text>
                    <Text>{`${user.firstName} ${user.lastName}`}</Text>
                    <Text>{`Posts: ${posts.length}`}</Text>
                </View>
            )}
            renderItem={({ item }) => (
                <View style={styles.post}>
                    <Text style={styles.postTitle}>{item.title}</Text>
                    <Text>{item.content}</Text>
                    <Text style={styles.postDate}>{item.createdAt}</Text>
                    {item.subpost && (
                        <View>
                            <Text style={styles.subpost}>{`Subpost: ${item.subpost.content}`}</Text>
                        </View>
                    )}
                    {item.comments.map(comment => (
                        <Text key={comment.id}>{comment.text} - {comment.username}</Text>
                    ))}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item)}>
                            <FontAwesome5 name="pray" size={20} color={item.currentUserLiked ? "#3a506b" : "black"} />
                            <Text>{` Likes: ${item.likes.length}`}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={() => navigation.navigate('Comment', { postId: item.id, sourceScreen: 'SearchedProfile' })}
                            >
                            <FontAwesome5 name="comment" size={20} color="black" />
                            <Text> Comment</Text>
                        </TouchableOpacity>

                    </View>
                    
                </View>
            )}
            ListEmptyComponent={() => (
                <Text style={styles.emptyText}>User has no posts</Text>
            )}
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#d2e7d6',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%',
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    post: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    postContent: {
        fontSize: 14,
    },
    postDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    subpost: {
        fontSize: 14,
        color: '#333',
        marginTop: 5,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    commentButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    commentButtonText: {
        color: '#fff',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    }
});

export default SearchedProfile;
