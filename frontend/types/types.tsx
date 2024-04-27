

export interface firebaseUser {
    uid: string;
    email?: string | null;
    displayName?: string | null;
}

export type RootParamList = {
    Auth: undefined;
    Account: { user: firebaseUser };
};

export type MainScreenParamList = {
    UserFeed: undefined;
    Search: undefined;
    Post: undefined;
    Notifications: undefined;
    Profile: { userId: string };
};
