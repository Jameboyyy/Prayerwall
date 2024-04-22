export interface CustomPost{
    Users: boolean;
    // Add any additional properties specific to your application
    // For example:
    objectId: string;
    title: string;
    content: string;
    userName: string;
    ownerId: string;
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
