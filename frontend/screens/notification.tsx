import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

interface NotificationProps {
  currentUser: any; // Adjust the type of currentUser as needed
}

interface Notification {
  id: string;
  content: string;
  postTitle?: string;
  postContent?: string;
  subpostContent?: string;
  username?: string; // Username of the user who made the post
}

const Notification: React.FC<NotificationProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      console.log("No user available");
      return;
    }

    const firestore = getFirestore();
    const notificationsRef = collection(firestore, 'notifications');
    const notificationsQuery = query(notificationsRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(notificationsQuery, async (snapshot) => {
      const notificationDetails = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        let postTitle = "";
        let postContent = "";
        let subpostContent = "";
        let username = "";

        if (data.postId) {
          const postRef = doc(firestore, "posts", data.postId);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            const postData = postSnap.data();
            postTitle = postData.title;
            postContent = postData.content;
            subpostContent = postData.subpost?.content || "No subpost";
            const userRef = doc(firestore, "users", postData.userId);
            const userSnap = await getDoc(userRef);
            username = userSnap.exists() ? userSnap.data().username : "Unknown user";
          }
        }

        return {
          id: docSnapshot.id,
          content: data.content,
          postTitle: postTitle,
          postContent: postContent,
          subpostContent: subpostContent,
          username: username
        };
      }));
      setNotifications(notificationDetails);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return <Text>Loading user data...</Text>;
  }

  const onRefresh = () => {
    setRefreshing(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3a506b']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications</Text>
      ) : (
        notifications.map(notification => (
          <View key={notification.id} style={styles.notification}>
            <Text style={styles.notificationText}> A post you subscribed to was updated!</Text>
            <Text style={styles.usernameText}>{notification.username}</Text>
            <Text style={styles.titleText}>Title: {notification.postTitle}</Text>
            <Text style={styles.contentText}>Content: {notification.postContent}</Text>
            <Text style={styles.subpostText}>Subpost: {notification.subpostContent}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d2e7d6',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3a506b',
  },
  noNotifications: {
    fontSize: 18,
    color: '#333',
  },
  notification: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {      width: 2,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationText: {
    fontFamily: 'JosefinSans-Regular',
    color: '#3a506b',
    fontSize: 16,
    marginBottom: 10,
  },
  usernameText: {
    fontFamily: 'JosefinSans-Bold',
    color: '#3a506b',
    fontSize: 20,
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'JosefinSans-Regular',
    fontSize: 16,
    marginBottom: 4,
    color: '#36454f'
  },
  contentText: {
    fontFamily: 'JosefinSans-Regular',
    fontSize: 16,
    marginBottom: 4,
    color: '#36454f',
  }, 
  subpostText: {
    fontFamily: 'JosefinSans-Regular',
    fontSize: 16,
    marginBottom: 4,
    color: '#36454f'
  }
});

export default Notification;
