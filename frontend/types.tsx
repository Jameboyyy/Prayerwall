interface Post {
  id: string;
  content: string;
}

interface Follower {
  userId: string;
}

export interface User {
  objectId: string;
  userName: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  userFollowers: any[];
  userFollowing: any[];
  userPosts: any[];
}
