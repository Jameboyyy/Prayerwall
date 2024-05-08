import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, runTransaction, where, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NavigationProp } from '@react-navigation/native';
import createNotification from '../notification/notificationUtil';

interface Subpost {
    content: string;
    createdAt: string;
}

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    username: string;
    userId: string;
    likes: number;
    currentUserLiked: boolean;
    subpost?: Subpost;
    isSubscribed: boolean;
}

interface Props {
    navigation: NavigationProp<any>;
}

const UserFeed: React.FC<Props> = ({ navigation }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState('');
    const [subpostContents, setSubpostContents] = useState<{ [key: string]: string }>({});
    const firestore = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        let unsubscribe = () => {};
    
        if (currentUser) {
            const postsQuery = query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
            unsubscribe = onSnapshot(postsQuery, async (querySnapshot) => {
                const postsData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
                    const postData = docSnapshot.data();
                    const userRef = doc(firestore, "users", postData.userId);
                    const userSnapshot = await getDoc(userRef);
                    const user = userSnapshot.data();
                    const username = user ? user.username : "Unknown";
    
                    const subRef = collection(firestore, "subscriptions");
                    const subQuery = query(subRef, where("subscriberId", "==", currentUser?.uid), where("subscribedToId", "==", postData.userId));
                    const subSnapshot = await getDocs(subQuery);
                    const isSubscribed = !subSnapshot.empty;
    
                    return {
                        id: docSnapshot.id,
                        title: postData.title,
                        content: postData.content,
                        createdAt: postData.createdAt.toDate().toString(),
                        username: username,
                        userId: postData.userId,
                        likes: postData.likes || 0,
                        currentUserLiked: postData.likes && Array.isArray(postData.likes) ? postData.likes.includes(currentUser?.uid) : false,
                        subpost: postData.subpost ? {
                            content: postData.subpost.content,
                            createdAt: postData.subpost.createdAt
                        } : undefined,
                        isSubscribed: isSubscribed
                    };
                }));
                setPosts(postsData);
            });
        }
    
        return () => unsubscribe();
    }, [currentUser]);
    
    const handleLike = async (post: Post) => {
        const postRef = doc(firestore, "posts", post.id);
        const likesRef = collection(firestore, "posts", post.id, "likes");
        const userLikeRef = doc(likesRef, currentUser?.uid);
    
        try {
            await runTransaction(firestore, async (transaction) => {
                const userLikeSnap = await transaction.get(userLikeRef);
                const postSnap = await transaction.get(postRef);
                const postData = postSnap.data();
    
                let postLikes: string[] = Array.isArray(postData?.likes) ? postData?.likes : []; // Ensure postLikes is initialized properly
    
                if (userLikeSnap.exists()) {
                    transaction.delete(userLikeRef);
                    postLikes = postLikes.filter((userId: string) => userId !== currentUser?.uid);
                } else {
                    transaction.set(userLikeRef, { likedAt: new Date() });
                    if (currentUser?.uid) {
                        postLikes.push(currentUser.uid);
                    }
                }
    
                transaction.update(postRef, { likes: postLikes });
            });
        } catch (error) {
            console.error("Transaction failed: ", error);
        }
    };
    

    const handleSubscribe = async (post: Post) => {
        try {
            const subRef = collection(firestore, "subscriptions");
            // Refactor the query to be more efficient
            const subsQuery = query(subRef, where("subscriberId", "==", currentUser?.uid), where("subscribedToId", "==", post.id));
            const querySnapshot = await getDocs(subsQuery);
            const existingSubscription = querySnapshot.docs.length > 0;
    
            console.log(`Subscription status for post ${post.id}: ${existingSubscription ? 'Subscribed' : 'Not Subscribed'}`);
    
            if (existingSubscription) {
                // Unsubscribe logic
                const subscriptionDoc = querySnapshot.docs[0];
                console.log(`Unsubscribing from post: ${post.id}`);
                await deleteDoc(subscriptionDoc.ref);
            } else {
                // Subscribe logic
                console.log(`Subscribing to post: ${post.id}`);
                await addDoc(subRef, {
                    subscriberId: currentUser?.uid,
                    subscribedToId: post.id,
                    createdAt: new Date().toISOString()
                });
            }
    
            // Update local state to reflect subscription status
            setPosts(prevPosts =>
                prevPosts.map(prevPost =>
                    prevPost.id === post.id ? { ...prevPost, isSubscribed: !existingSubscription } : prevPost
                )
            );
        } catch (error) {
            console.error("Error handling subscription:", error);
        }
    };
    
    
    
    const handleSubpostSubmit = async (postId) => {
        const content = subpostContents[postId];
        if (!content.trim()) {
            console.error('Subpost content is empty');
            return;
        }
    
        console.log("Submitting subpost for post ID:", postId);
        const postRef = doc(getFirestore(), "posts", postId);
        await updateDoc(postRef, {
            subpost: {
                content: content,
                createdAt: new Date().toISOString()
            }
        });
    
        console.log("Subpost added, fetching subscriptions...");
        const subscriptionsRef = collection(getFirestore(), "subscriptions");
        const subscriptionsQuery = query(subscriptionsRef, where("subscribedToId", "==", postId));
        const subscriptionSnapshots = await getDocs(subscriptionsQuery);
    
        subscriptionSnapshots.forEach(async (docSnapshot) => {
            const subscription = docSnapshot.data();
            console.log("Notifying subscriber:", subscription.subscriberId);
            await createNotification(subscription.subscriberId, "subpost_added", "A new subpost was added.", postId);
        });
    };
    
    
    const handleSubpostChange = (text: string, postId: string) => {
        setSubpostContents({ ...subpostContents, [postId]: text });
    };
    const handleEllipsisPress = (postId: string) => {
        setSelectedPostId(postId);
        setModalVisible(true);
    };

    // Define a function to handle reporting a post
    const handleReport = async (post: Post) => {
        try {
            // Create a reference to the 'reported_posts' collection
            const reportedPostsRef = collection(firestore, 'reported_posts');

            // Add the reported post to the 'reported_posts' collection
            await addDoc(reportedPostsRef, {
                postId: post.id,
                title: post.title,
                content: post.content,
                username: post.username,
                userId: post.userId,
                reportedAt: new Date().toISOString(),
            });

            console.log('Post reported successfully:', post.id);
            setModalVisible(false); // Close the modal after reporting
        } catch (error) {
            console.error('Error reporting post:', error);
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
                        <Text style={styles.postContent}>{post.content}</Text>
                        <Text style={styles.postDate}>{post.createdAt}</Text>
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post)}>
                                <FontAwesome5 name="pray" size={20} color={post.currentUserLiked ? "#3a506b" : "black"} />
                                {Array.isArray(post.likes) ? (
                                    <Text> {post.likes.length}</Text>
                                ) : (
                                    <Text> {post.likes}</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionButton} 
                                onPress={() => navigation.navigate('UserComments', { postId: post.id, sourceScreen: 'UserFeed' })}
                            >
                                <FontAwesome5 name="comment" size={20} color="black" />
                            </TouchableOpacity>
                            {currentUser?.uid !== post.userId && !post.subpost && ( // Display subscription button only if it's not the user's own post and there's no subpost
                            <TouchableOpacity 
                                style={styles.actionButton} 
                                onPress={() => handleSubscribe(post)}
                            >
                                <FontAwesome5 name="plus" size={20} color={post.isSubscribed ? "#3a506b" : "black"} />
                            </TouchableOpacity>

                            )}
                        </View>


                        {post.subpost && (
                            <View style={styles.subpostContainer}>
                                <Text style ={styles.subpostText}>{`${post.username}: ${post.subpost.content}`}</Text>
                                <Text style={styles.subpostDate}>{new Date(post.subpost.createdAt).toLocaleDateString()}</Text>
                            </View>
                        )}
                        {currentUser?.uid === post.userId && !post.subpost && (
                            <View style={styles.subpostContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your subpost"
                                    value={subpostContents[post.id]}
                                    onChangeText={(text) => handleSubpostChange(text, post.id)}
                                    autoCapitalize='none'
                                />
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleSubpostSubmit(post.id)}
                                >
                                    <Text style={styles.subpostBtnText}>Submit Subpost</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity style={styles.ellipsisContainer} onPress={() => handleEllipsisPress(post.id)}>
                            <FontAwesome5 name="ellipsis-v" size={20} color="#36454f" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setModalVisible(false)}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView} onStartShouldSetResponder={() => true}>
                            {posts.find(post => post.id === selectedPostId)?.userId === currentUser?.uid ? (
                                <Pressable
                                    style={[styles.optionButton, styles.editButton]}
                                    onPress={() => {
                                        navigation.navigate('EditUserPost', { postId: selectedPostId });
                                        setModalVisible(false);
                                    }}
                                >
                                    <FontAwesome5 name="edit" size={20} color="white" />
                                    <Text style={styles.optionText}>Edit</Text>
                                </Pressable>
                            ) : (
                                <Pressable
                                    style={[styles.optionButton, styles.reportButton]}
                                    onPress={() => {
                                        console.log("Report post");
                                        handleReport(posts.find(post => post.id === selectedPostId)!); // Call handleReport function
                                    }}
                                >
                                    <FontAwesome5 name="exclamation" size={20} color="white" />
                                    <Text style={styles.optionText}>Report</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
            <TouchableOpacity
                style={styles.messageIcon}
                onPress={() => navigation.navigate('UsersList')}
            >
                <FontAwesome5 name="comments" size={24} color="#36454F" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e7d6',
        paddingTop: '20%'
    },
    scrollContainer: {
        alignItems: 'center'
    },
    messageIcon: {
        color: '#36454f',
        position: 'absolute',
        top: '10%',
        right: 10,
        justifyContent: 'flex-end'
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
        fontWeight: 'bold',
        color: '#36454f',
        fontFamily: 'JosefinSans-Bold',
        marginTop: 5,
    },
    postContent:{
        color: '#36454f',
        fontFamily: 'JosefinSans-Regular',
        fontSize: 16,
        marginTop: 5,
        marginBottom: 5,
    },
    postDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        fontFamily: 'JosefinSans-Regular',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        marginBottom: 10
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20
    },
    ellipsisContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10 // Ensure the area is large enough to easily tap
    },
    centeredView: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
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
    subpostContainer: {
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    subpostText: {
        color: '#36454f',
        fontFamily: 'JosefinSans-Regular',
    },
    input: {
        width: '90%',
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
        color: '#36454f',
        fontFamily: 'JosefinSans-Regular',
    },
    button: {
        backgroundColor: '#3a506b',
        padding: 10,
        borderRadius: 5,
    },
    subpostDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        fontFamily: 'JosefinSans-Regular',
    },
    subpostBtnText: {
        color: '#f5f5f5',
        fontFamily: 'JosefinSans-Regular',
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
        fontFamily: 'JosefinSans-Regular',
    },
    reportButton: {
        backgroundColor: '#ff6b6b',
    },
    editButton: {
        backgroundColor: '#3a506b',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'  // Semi-transparent background to allow outside modal clicks
    }
});

export default UserFeed;
