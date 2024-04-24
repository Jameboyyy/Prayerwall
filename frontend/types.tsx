export interface CustomPost{
    Users: boolean;
    objectId: string;
    title: string;
    content: string;
    userName: string;
    ownerId: string;
    created: string;
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
  userPosts: CustomPost[];
}
