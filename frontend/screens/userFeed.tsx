import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Switch } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import StackNavigationProp

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    username: string;
    userId: string; // Include userId in the Post interface
}

interface Props {
    navigation: NavigationProp<any>; // Define the type of navigation prop
}

const UserFeed: React.FC<Props> = ({ navigation }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
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
                    userId: postData.userId
                };
            });
            Promise.all(postsFetchPromises).then(setPosts);
        });

        return () => unsubscribe();
    }, [isPublic]);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    return (
        <View style={styles.container}>
            <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>{isPublic ? 'Public' : 'Friends Only'}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isPublic ? "#f5dd4b" : "#f4f3f4"}
                    onValueChange={() => setIsPublic(previousState => !previousState)}
                    value={isPublic}
                />
            </View>
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
                        {auth.currentUser?.uid === post.userId && (
                            <TouchableOpacity style={styles.editButton}
                                onPress={() => navigation.navigate('EditPost', { postId: post.id })}>
                                <FontAwesome5 name="ellipsis-v" size={20} color="black" />
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
        width: '100%'
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
        color: '#666'
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    toggleLabel: {
        fontSize: 18,
        color: '#3a506b',
        fontFamily: 'JosefinSans-Regular'
    },
    editButton: {
        padding: 5,
        alignSelf: 'flex-end',
        marginTop: -40,  // Adjust as necessary
        color: '#black',
    }
});

export default UserFeed;
