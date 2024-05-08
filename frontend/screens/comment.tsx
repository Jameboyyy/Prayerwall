import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Button } from 'react-native';
import { getFirestore, collection, doc, getDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface CommentType {
    id: string;
    text: string;
    username?: string;
    createdAt?: { seconds: number, nanoseconds: number };
}

interface PostData {
    title: string;
    content: string;
    username?: string;
    createdAt?: { seconds: number, nanoseconds: number };
}

const Comment = ({ route, navigation }) => {
    const { postId } = route.params;
    const [post, setPost] = useState<PostData | null>(null);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [likesCount, setLikesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);
    const [newComment, setNewComment] = useState('');
    const firestore = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchPostDetails = async () => {
            const postRef = doc(firestore, 'posts', postId);
            const docSnap = await getDoc(postRef);
            if (docSnap.exists()) {
                const postData = docSnap.data();
                const username = await getUsername(postData.userId);
                setPost({ ...postData, username });
            } else {
                console.log('No such document!');
            }
        };
    
        fetchPostDetails();
    
        // These functions should internally check if currentUser exists before subscribing
        const unsubscribeComments = fetchComments();
        const unsubscribeLikes = fetchLikes();
    
        return () => {
            unsubscribeComments();
            unsubscribeLikes();
        };
    }, [postId, currentUser]);
    

    const getUsername = async (userId: string) => {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().username) {
            return userSnap.data().username;
        } else {
            return 'Unknown';
        }
    };

    const fetchComments = () => {
        if (!currentUser) {
            console.log('No user logged in, skipping comments subscription');
            return () => {};
        }
    
        const commentsCollection = collection(firestore, "posts", postId, "comments");
        return onSnapshot(commentsCollection, (querySnapshot) => {
            const commentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                text: doc.data().text,
                username: doc.data().username, // Assuming this is how username is stored
                createdAt: doc.data().createdAt
            }));
            setComments(commentsData);
            setCommentsCount(commentsData.length);
        }, error => {
            console.error("Error fetching comments:", error.message);
        });
    };
    
    const fetchLikes = () => {
        if (!currentUser) {
            console.log('No user logged in, skipping likes subscription');
            return () => {};
        }
    
        const likesCollection = collection(firestore, "posts", postId, "likes");
        return onSnapshot(likesCollection, (querySnapshot) => {
            setLikesCount(querySnapshot.size);
        }, error => {
            console.error("Error fetching likes:", error.message);
        });
    };
    
    
    const handleAddComment = async (sourceScreen: string) => {
        if (newComment.trim() === "") return;
    
        try {
            const userId = currentUser?.uid;
    
            if (!userId) {
                console.error("No user is currently logged in.");
                return;
            }
    
            const username = await getUsername(userId);
    
            const commentsCollection = collection(firestore, "posts", postId, "comments");
    
            await addDoc(commentsCollection, {
                text: newComment,
                userId: userId,
                createdAt: new Date(),
            });
    
            setNewComment('');
    
            // Navigate back to the specified screen
            if (sourceScreen === 'UserFeed') {
                navigation.navigate('UserFeed');
            } else if (sourceScreen === 'SearchedProfile') {
                navigation.navigate('SearchedProfile', { userId: post.userId });
            } else if (sourceScreen === 'Profile') {
                navigation.navigate('Profile');
            }
        } catch (error) {
            console.error("Error adding comment: ", error);
        }
    };
    

    if (!post) {
        return <Text>Loading post details...</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.postContainer}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent}>{post.content}</Text>
                <Text style={styles.postAuthor}>Posted by: {post.username || 'Unknown'}</Text>
                <Text style={styles.postDate}>Date: {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Date not available"}</Text>
                <Text style={styles.postLikesComments}>{likesCount} Likes • {commentsCount} Comments</Text>
            </View>
            <ScrollView style={styles.commentsContainer}>
                {comments.length === 0 ? (
                    <Text style={styles.noCommentsText}>Be the first to comment</Text>
                ) : (
                    comments.map((comment) => (
                        <View key={comment.id} style={styles.comment}>
                            <Text style={styles.commentText}>{comment.text}</Text>
                            <Text style={styles.commentDetails}>
                                Commented by {comment.username || 'Anonymous'} on{' '}
                                {comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Date not available'}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                    autoCapitalize='none'
                />
                <Button title="Post" onPress={handleAddComment} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#d2e7d6',
    },
    postContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#3a506b',
        fontFamily: 'JosefinSans-Bold',
    },
    postContent: {
        fontSize: 16,
        marginBottom: 5,
        color: '#36454f',
        fontFamily: 'JosefinSans-Regular',
    },
    postAuthor: {
        fontSize: 16,
        color: '#36454f',
        marginBottom: 5,
        fontFamily: 'JosefinSans-Regular',
    },
    postDate: {
        fontSize: 14,
        color: '#36454f',
        marginBottom: 5,
        fontFamily: 'JosefinSans-Regular',
    },
    postLikesComments: {
        fontSize: 12,
        color: '#36454f',
        marginBottom: 10,
        fontFamily: 'JosefinSans-Regular',
    },
    commentsContainer: {
        flex: 1,
        marginBottom: 10,
    },
    noCommentsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#36454f',
        fontFamily: 'JosefinSans-Regular',
    },
    comment: {
        backgroundColor: '#d2e7d6',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    commentText: {
        fontSize: 14,
        marginBottom: 5,
        fontFamily: 'JosefinSans-Regular',
        color: '#36454f',
    },
    commentDetails: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'JosefinSans-Regular',

    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        fontFamily: 'JosefinSans-Regular',
    },
});

export default Comment;
