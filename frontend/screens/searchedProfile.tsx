import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, FlatList, RefreshControl } from 'react-native';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

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
}

const SearchedProfile = ({ route }) => {
    const [user, setUser] = useState<User>({
        username: '',
        firstName: '',
        lastName: '',
        profilePicture: null
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);

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
        const userPosts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            content: doc.data().content,
            createdAt: doc.data().createdAt.toDate().toLocaleDateString()
        }));
        setPosts(userPosts);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
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
                        <Text>No Profile Picture</Text>
                    )}
                    <Text style={styles.username}>{user.username}</Text>
                    <Text>{`${user.firstName} ${user.lastName}`}</Text>
                    <Text>{`Posts: ${posts.length}`}</Text>
                </View>
            )}
            renderItem={({ item }) => (
                <View style={styles.post}>
                    <Text style={styles.postTitle}>{item.title}</Text>
                    <Text style={styles.postContent}>{item.content}</Text>
                    <Text style={styles.postDate}>{item.createdAt}</Text>
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
        backgroundColor: '#d2e7d6',
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
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    }
});

export default SearchedProfile;
