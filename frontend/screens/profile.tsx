import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../firebaseConfig';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Define the user state type
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
    createdAt: string;
    userId: string;
};

const Profile = ({ navigation }) => {
    const [user, setUser] = useState<UserProfile>({
        username: '',
        firstName: '',
        lastName: '',
        profilePicture: null,
        following: 0,
        followers: 0,
        posts: 0
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchData = async () => {
            await fetchUserData();
            await fetchUserPosts();
        };
        fetchData();
    }, [userId]);

    const fetchUserData = async () => {
        if (userId) {
            const userDocRef = doc(firestore, "users", userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUser(userDoc.data() as UserProfile);
            } else {
                console.log("No such document!");
            }
        }
    };

    const fetchUserPosts = async () => {
        if (userId) {
            // Ensure orderBy is correctly capitalized
            const postsQuery = query(collection(firestore, "posts"), where("userId", "==", userId), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(postsQuery);
            const userPosts = querySnapshot.docs.map(doc => {
                const postData = doc.data() as Post;
                return {
                    id: doc.id,
                    title: postData.title,
                    content: postData.content,
                    createdAt: postData.createdAt.toDate().toLocaleDateString(),
                    userId: postData.userId
                };
            });
            setPosts(userPosts);
            setUser(prev => ({ ...prev, posts: userPosts.length }));  // Update the number of posts
        }
    };
    

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserData().then(() => {
            fetchUserPosts().then(() => setRefreshing(false));
        });
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {user.profilePicture ? (
                <Image
                    source={{ uri: user.profilePicture }}
                    style={styles.profilePic}
                    resizeMode="cover"
                    onLoad={() => console.log('Image loaded!')}
                    onError={(e) => console.log('Failed to load the image:', e.nativeEvent.error)}
                />
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
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            {posts.map(post => (
                <View key={post.id} style={styles.post}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postContent}>{post.content}</Text>
                    <Text style={styles.postDate}>{post.createdAt}</Text>
                    {auth.currentUser?.uid === post.userId && (
                        <TouchableOpacity style={styles.editButton}
                            onPress={() => navigation.navigate('EditPost', { postId: post.id })}>
                            <FontAwesome5 name="ellipsis-v" size={20} color="black" />
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
        backgroundColor: '#d2e7d6',
        paddingVertical: 20
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        borderColor: '#ccc',
        borderWidth: 1
    },
    username: {
        fontSize: 16,
        color: '#3a506b',
        fontWeight: 'bold',
        marginBottom: 4
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20
    },
    stat: {
        fontSize: 16,
        color: '#333'
    },
    button: {
        backgroundColor: '#3a506b',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: '85%',
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'JosefinSans-Regular'
    },
    postsContainer: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center'
    },
    post: {
        width: '90%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4
    },
    postContent: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4
    },
    postDate: {
        fontSize: 12,
        color: '#666'
    },
    editButton: {
        padding: 5,
        alignSelf: 'flex-end',
        marginTop: -40,
        color: '#black',
    }
});

export default Profile;
