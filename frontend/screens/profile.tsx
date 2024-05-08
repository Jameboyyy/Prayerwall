import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, RefreshControl, TextInput, Modal } from 'react-native';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, deleteDoc, runTransaction, onSnapshot } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth'; // Import signOut from auth
import { firestore } from '../firebaseConfig';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type UserProfile = {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    posts: number;
};

type Subpost = {
    content: string;
    createdAt: string;
};

type Post = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    userId: string;
    likes: string[];
    currentUserLiked: boolean;
    subpost?: Subpost;
};
const Profile = ({ navigation }) => {
    const [user, setUser] = useState<UserProfile>({
        username: '',
        firstName: '',
        lastName: '',
        profilePicture: null,
        posts: 0
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const [subpostContents, setSubpostContents] = useState<{ [key: string]: string }>({});
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState('');

    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    let unsubscribeUserDoc = () => {};
    let unsubscribePosts = () => {};

    useEffect(() => {
        if (!userId) {
            console.log("No user ID available, skipping subscription setup.");
            return;
        }
    
        const userDocRef = doc(firestore, "users", userId);
        const postsQuery = query(collection(firestore, "posts"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    
        const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setUser(docSnapshot.data() as UserProfile);
            } else {
                console.log("No such document!");
            }
        }, error => console.log("Error listening to user data:", error));
    
        const unsubscribePosts = onSnapshot(postsQuery, (querySnapshot) => {
            const userPosts = querySnapshot.docs.map(doc => {
                const postData = doc.data() as Post;
                const likes = Array.isArray(postData.likes) ? postData.likes : [];
                return {
                    ...postData,
                    id: doc.id,
                    createdAt: postData.createdAt.toDate().toLocaleDateString(),
                    userId: postData.userId,
                    likes: likes,
                    currentUserLiked: likes.includes(userId),
                    subpost: postData.subpost ? {
                        content: postData.subpost.content,
                        createdAt: postData.subpost.createdAt
                    } : undefined
                };
            });
            setPosts(userPosts);
            setUser(prev => ({ ...prev, posts: userPosts.length }));
        }, error => console.log("Error listening to posts:", error));
    
        // Cleanup function that unsubscribes from firestore listeners
        return () => {
            unsubscribeUserDoc();
            unsubscribePosts();
        };
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
            const postsQuery = query(collection(firestore, "posts"), where("userId", "==", userId), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(postsQuery);
            const userPosts = querySnapshot.docs.map(doc => {
                const postData = doc.data() as Post;
                // Ensure likes is an array, defaulting to an empty array if undefined
                const likes = Array.isArray(postData.likes) ? postData.likes : [];
                return {
                    ...postData,
                    id: doc.id,
                    createdAt: postData.createdAt.toDate().toLocaleDateString(),
                    userId: postData.userId,
                    likes: likes,
                    currentUserLiked: likes.includes(userId),  // Now safely using includes
                    subpost: postData.subpost ? {
                        content: postData.subpost.content,
                        createdAt: postData.subpost.createdAt
                    } : undefined
                };
            });
            setPosts(userPosts);
            setUser(prev => ({ ...prev, posts: userPosts.length }));
        }
    };
    

    const handleLike = async (post: Post) => {
        const postRef = doc(firestore, "posts", post.id);
        await runTransaction(firestore, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            const postData = postDoc.data() as Post;
            let postLikes = postData.likes || []; // Ensure this is always treated as an array
            if (postLikes.includes(userId)) {
                postLikes = postLikes.filter(id => id !== userId);
            } else {
                postLikes.push(userId);
            }
            transaction.update(postRef, { likes: postLikes });
            setPosts(posts.map(p => p.id === post.id ? { ...p, likes: postLikes, currentUserLiked: postLikes.includes(userId) } : p));
        });
    };
    

    const handleSubpostSubmit = async (postId: string) => {
        const content = subpostContents[postId];
        if (!content.trim()) return;

        const postRef = doc(firestore, "posts", postId);
        await updateDoc(postRef, {
            subpost: {
                content,
                createdAt: new Date().toISOString()
            }
        });
        setSubpostContents({ ...subpostContents, [postId]: '' });
        setPosts(posts.map(post => post.id === postId ? {
            ...post,
            subpost: { content, createdAt: new Date().toISOString() }
        } : post));
    };

    const handleSubpostChange = (text: string, postId: string) => {
        setSubpostContents({ ...subpostContents, [postId]: text });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserData().then(() => {
            fetchUserPosts().then(() => setRefreshing(false));
        });
    };

    const showModal = (postId: string) => {
        setSelectedPostId(postId);
        setModalVisible(true);
    };

    const handleDelete = async () => {
        if (selectedPostId) {
            await deleteDoc(doc(firestore, "posts", selectedPostId));
            setPosts(posts.filter(post => post.id !== selectedPostId));
            setModalVisible(false);
        }
    };

    const handleEdit = () => {
        navigation.navigate('EditUserPost', { postId: selectedPostId });
        setModalVisible(false);
    };

    const handleLogout = async () => {
        try {
            // Check authentication status before sign-out
            console.log("Current user:", auth.currentUser);
            
            // Unsubscribe from Firestore listeners if they are active
            if (unsubscribeUserDoc) unsubscribeUserDoc();
            if (unsubscribePosts) unsubscribePosts();
    
            // Attempt to sign out
            await signOut(auth);
            console.log("User signed out successfully.");
            
            // Navigate to the login screen or any other screen after logout
            navigation.navigate('Auth');
        } catch (error) {
            // Log any errors that occur during sign-out
            console.error('Error signing out: ', error);
            // If sign-out fails, log the current user to help diagnose the issue
            console.log("Current user:", auth.currentUser);
        }
    };
    
    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <FontAwesome5 name="sign-out-alt" size={20} color="#3a506b" />
            </TouchableOpacity>
            {user.profilePicture && (
                <Image
                    source={{ uri: user.profilePicture }}
                    style={styles.profilePic}
                    resizeMode="cover"
                />
            )}
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
            <View style={styles.statsContainer}>
                <Text style={styles.stat}>{`Posts: ${user.posts}`}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            {posts.map(post => (
                <View key={post.id} style={styles.post}>
                    <TouchableOpacity style={styles.editButton} onPress={() => showModal(post.id)}>
                        <FontAwesome5 name="ellipsis-v" size={20} color="#36454f" />
                    </TouchableOpacity>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postContent}>{post.content}</Text>
                    <Text style={styles.postDate}>{post.createdAt}</Text>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={() => handleLike(post)} style={styles.likeButton}>
                            <FontAwesome5 name="pray" size={20} color={post.currentUserLiked ? "#3a506b" : "#36454f"} />
                            <Text> {post.likes.length} Likes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.commentButton}
                            onPress={() => navigation.navigate('UserComments', { postId: post.id })}
                        >
                            <FontAwesome5 name="comment" size={20} color="#36454f" />
                        </TouchableOpacity>
                    </View>
                    {post.subpost ? (
                        <Text style={styles.subpostText}>Update: {post.subpost.content}</Text>
                    ) : (
                        <View style={styles.subpostInputContainer}>
                            <TextInput
                                style={styles.subpostInput}
                                placeholder="Add a subpost"
                                value={subpostContents[post.id] || ''}
                                onChangeText={(text) => handleSubpostChange(text, post.id)}
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => handleSubpostSubmit(post.id)}
                            >
                                <Text style={styles.submitButtonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ))}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.textStyle}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonDelete]}
                            onPress={handleDelete}
                        >
                            <Text style={styles.textStyle}>Delete Post</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonEdit]}
                            onPress={handleEdit}
                        >
                            <Text style={styles.textStyle}>Edit Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: '#d2e7d6',
        paddingVertical: 20,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        marginTop: 50
    },
    username: {
        fontSize: 20,
        color: '#3a506b',
        fontFamily: 'JosefinSans-Bold',
        marginBottom: 10
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#36454f',
        fontFamily: 'JosefinSans-Regular'
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20
    },
    stat: {
        fontSize: 16,
        color: '#36454f',
        fontFamily: 'JosefinSans-Regular'

    },
    button: {
        backgroundColor: '#3a506b',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: '85%',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'JosefinSans-Regular'
    },
    post: {
        width: '90%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        position: 'relative'
    },
    postTitle: {
        fontSize: 16,
        fontFamily: 'JosefinSans-Bold',
        color: '#36454f',
        marginBottom: 4
    },
    postContent: {
        fontSize: 14,
        fontFamily: 'JosefinSans-Regular',
        color: '#36454f',
        marginBottom: 4,
        width: '90%'
    },
    postDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10
    },
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    subpostText: {
        color: '#36454f',
        fontSize: 14,
        marginBottom: 10,
        fontFamily: 'JosefinSans-Regular'
    },
    subpostInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    },
    subpostInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginRight: 10,
        borderRadius: 5,
        fontFamily: 'JosefinSans-Regular',
        color: '#36545f'
    },
    submitButton: {
        backgroundColor: '#3a506b',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    submitButtonText: {
        color: '#f5f5f5',
        fontFamily: 'JosefinSans-Regular'
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        color: 'black',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    buttonClose: {
        backgroundColor: "#36454f",
    },
    buttonDelete: {
        backgroundColor: "#ff6b6b",
        marginTop: 10,
    },
    buttonEdit: {
        backgroundColor: "#3a506b",
        marginTop: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    textStyle: {
        color: "#f5f5f5",
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: 'JosefinSans-Regular'
    },
    logoutButton: {
        position: 'absolute',
        top: '10%',
        right: 10,
    }
});

export default Profile;
