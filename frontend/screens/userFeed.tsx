import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NavigationProp } from '@react-navigation/native';

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
        const postsQuery = query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(postsQuery, async (querySnapshot) => {
            const postsData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
                const postData = docSnapshot.data();
                const userRef = doc(firestore, "users", postData.userId);
                const userSnapshot = await getDoc(userRef);
                const user = userSnapshot.data();
                const username = user ? user.username : "Unknown";

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
                    } : undefined
                };
            }));
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, [currentUser]);const handleLike = async (post: Post) => {
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
            });
        } catch (error) {
            console.error("Transaction failed: ", error);
        }
    };
    
    
    const handleSubpostSubmit = async (postId: string) => {
        const content = subpostContents[postId];
        if (!content.trim()) {
            console.error('Subpost content is empty');
            return;
        }

        const postRef = doc(firestore, "posts", postId);
        try {
            await updateDoc(postRef, {
                subpost: {
                    content: content,
                    createdAt: new Date().toISOString()
                }
            });
            setSubpostContents({ ...subpostContents, [postId]: '' });
        } catch (error) {
            console.error('Error adding subpost:', error);
        }
    };

    const handleSubpostChange = (text: string, postId: string) => {
        setSubpostContents({ ...subpostContents, [postId]: text });
    };

    const handleEllipsisPress = (postId: string) => {
        setSelectedPostId(postId);
        setModalVisible(true);
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
                        <Text style={styles.postDate}>{post.createdAt}</Text><View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post)}>
                                <FontAwesome5 name="pray" size={20} color={post.currentUserLiked ? "#3a506b" : "black"} />
                                {Array.isArray(post.likes) ? (
                                    <Text> {post.likes.length}</Text>
                                ) : (
                                    <Text> {post.likes}</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Comment', { postId: post.id })}>
                                <FontAwesome5 name="comment" size={20} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.ellipsisContainer} onPress={() => handleEllipsisPress(post.id)}>
                                <FontAwesome5 name="ellipsis-v" size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                        {post.subpost && (
                            <View style={styles.subpostContainer}>
                                <Text>{`${post.username}: ${post.subpost.content}`}</Text>
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
                                />
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleSubpostSubmit(post.id)}
                                >
                                    <Text>Submit Subpost</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
                                        navigation.navigate('EditPost', { postId: selectedPostId });
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
                                        setModalVisible(false);
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
    input: {
        width: '90%',
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    subpostDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 4
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
    },
    reportButton: {
        backgroundColor: 'red',
    },
    editButton: {
        backgroundColor: 'blue',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'  // Semi-transparent background to allow outside modal clicks
    }
});

export default UserFeed;
