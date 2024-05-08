import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, FlatList, RefreshControl, TouchableOpacity, Modal, Pressable } from 'react-native';
import { doc, getDoc, collection, query, where, getDocs, orderBy, runTransaction, addDoc, deleteDoc } from 'firebase/firestore';
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
    isSubscribed: boolean;
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
    const [user, setUser] = useState<User>({ username: '', firstName: '', lastName: '', profilePicture: null });
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState('');
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
                likes: data.likes || [],
                currentUserLiked: data.likes.includes(currentUser?.uid),
                subpost: data.subpost ? {
                    content: data.subpost.content,
                    createdAt: new Date(data.subpost.createdAt.seconds * 1000)
                } : undefined,
                comments: data.comments || [],
                newCommentText: '',
                isSubscribed: false
            };
        });
        setPosts(userPosts);
        updateSubscriptionStatus(userPosts);
    };

    const updateSubscriptionStatus = async (userPosts) => {
        const subsQuery = query(collection(firestore, "subscriptions"), where("subscriberId", "==", currentUser?.uid));
        const subsSnapshot = await getDocs(subsQuery);
        const subscriptions = subsSnapshot.docs.map(doc => doc.data().subscribedToId);
        const postsWithSubStatus = userPosts.map(post => ({
            ...post,
            isSubscribed: subscriptions.includes(post.id)
        }));
        setPosts(postsWithSubStatus);
    };

    const handleLike = async (post: Post) => {
        const postRef = doc(firestore, "posts", post.id);
        const likesRef = collection(firestore, "posts", post.id, "likes");
        const userLikeRef = doc(likesRef, currentUser?.uid);

        await runTransaction(firestore, async (transaction) => {
            const userLikeSnap = await transaction.get(userLikeRef);
            const postSnap = await transaction.get(postRef);
            const postData = postSnap.data();

            let postLikes: string[] = postData?.likes || [];

            if (userLikeSnap.exists()) {
                transaction.delete(userLikeRef);
                postLikes = postLikes.filter((userId: string) => userId !== currentUser?.uid);
            } else {
                transaction.set(userLikeRef, { likedAt: new Date() });
                postLikes.push(currentUser.uid);
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
    };

    const handleSubscribe = async (post: Post) => {
        if (post.subpost) return; // Do not subscribe if there is already a subpost

        const subRef = collection(firestore, "subscriptions");
        const subQuery = query(subRef, where("subscriberId", "==", currentUser?.uid), where("subscribedToId", "==", post.id));
        const querySnapshot = await getDocs(subQuery);
        const existingSubscription = querySnapshot.docs.length > 0;

        if (existingSubscription) {
            await deleteDoc(querySnapshot.docs[0].ref);
            updatePostSubscriptionStatus(post.id, false);
        } else {
            await addDoc(subRef, {
                subscriberId: currentUser?.uid,
                subscribedToId: post.id,
                createdAt: new Date().toISOString()
            });
            updatePostSubscriptionStatus(post.id, true);
        }
    };

    const handleReport = async (post) => {
        try {
            // Reference to the 'reported_posts' collection in Firestore
            const reportedPostsRef = collection(firestore, 'reported_posts');
    
            // Add a new document to the 'reported_posts' collection
            await addDoc(reportedPostsRef, {
                postId: post.id,
                userId: post.userId,
                reportedAt: new Date().toISOString(), // Timestamp of the report
                reporterId: currentUser.uid, // ID of the user who reported the post
                // Additional data can be included here if necessary
            });
    
            console.log('Post reported successfully:', postId);
            setModalVisible(false); // Close the modal after reporting
        } catch (error) {
            console.error('Error reporting post:', error);
        }
    };
    

    const updatePostSubscriptionStatus = (postId: string, isSubscribed: boolean) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId ? { ...post, isSubscribed } : post
            )
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
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
                        <Text style={styles.profileName}>{`${user.firstName} ${user.lastName}`}</Text>
                        <Text style={styles.postCount}>{`Posts: ${posts.length}`}</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={styles.post}>
                        <Text style={styles.postTitle}>{item.title}</Text>
                        <Text style={styles.postContent}>{item.content}</Text>
                        <Text style={styles.postDate}>{item.createdAt}</Text>
                        {item.subpost && (
                            <View>
                                <Text style={styles.subpost}>{`Subpost: ${item.subpost.content}`}</Text>
                            </View>
                        )}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item)}>
                                <FontAwesome5 name="pray" size={20} color={item.currentUserLiked ? "#3a506b" : "black"} />
                                <Text>{`  ${item.likes.length}`}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => navigation.navigate('UserComments', { postId: item.id })}
                            >
                                <FontAwesome5 name="comment" size={20} color="black" />
                            </TouchableOpacity>
                            {!item.subpost && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleSubscribe(item)}
                            >
                                <FontAwesome5 name="plus" size={20} color={item.isSubscribed ? "#3a506b" : "black"} />
                            </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity style={styles.ellipsisContainer} onPress={() => { setModalVisible(true); setSelectedPostId(item.id); }}>
                            <FontAwesome5 name="ellipsis-v" size={20} color="#36454f" />
                        </TouchableOpacity>
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
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);  // This will allow hardware back button on Android to close the modal
            }}
        >
            {/* Overlay to capture outside taps */}
            <TouchableOpacity
                style={styles.centeredView}
                activeOpacity={1}  // Maintain the view's visibility when pressed
                onPressOut={() => setModalVisible(false)}  // This will handle the press outside of the modal content
            >
                <View style={styles.modalView} onStartShouldSetResponder={() => true}>
                    <Pressable
                        style={[styles.optionButton, styles.reportButton]}
                        onPress={() => handleReport(selectedPostId)}
                    >
                        <FontAwesome5 name="exclamation" size={20} color="white" />
                        <Text style={styles.optionText}>Report</Text>
                    </Pressable>
                    <Pressable
                        style={styles.optionButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.optionText}>Cancel</Text>
                    </Pressable>
                </View>
            </TouchableOpacity>
        </Modal>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontFamily: 'JosefinSans-Bold',
        color: '#3a506b',
    },
    profileName: {
        fontSize: 16,
        fontFamily: 'JosefinSans-Regular',
        marginBottom: 10, 
        color: '#36454f'
    },
    post: {
        backgroundColor: '#d2e7d6',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    postTitle: {
        fontSize: 16,
        fontFamily: 'JosefinSans-Bold',
        marginBottom: 4,
        color: '#3a506b',
    },
    postContent: {
        fontSize: 14,
        fontFamily: 'JosefinSans-Regular',
        marginBottom: 4,
        color: '#36454f'
    },
    postDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        fontFamily: 'JosefinSans-Regular',
    },
    postCount: {
        fontFamily: 'JosefinSans-Regular',
        fontSize: 16,
        color: '#36454f',
    },
    subpost: {
        fontSize: 14,
        color: '#36454f',
        marginTop: 5,
        fontFamily: 'JosefinSans-Regular',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15
    },
    ellipsisContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
    },
    reportButton: {
        backgroundColor: '#ff6b6b',
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
        fontFamily: 'JosefinSans-Regular',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    }
});

export default SearchedProfile;
