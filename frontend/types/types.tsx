export type RootParamList = {
    Auth: undefined;
    Account: undefined;
    Main: undefined;
    EditPost: { postId: string};
    UserFeed: undefined;
};

export type MainTabParamList = {
    UserFeed: undefined;
    Search: undefined;
    Post: undefined;
    Notification: undefined;
    ProfileTab: undefined;  // This now points to the ProfileStack
    Main: undefined;
};

export type SecondaryScreenParamList = {
    EditProfile: undefined;
    SearchedProfile: undefined;
    GroupChat: undefined;
    EditPost: { postId: string};
};
