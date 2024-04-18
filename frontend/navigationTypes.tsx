// navigationTypes.ts
export type RootStackParamList = {
    Auth: undefined;
    Account: { ownerId: string };
    MainTab: { screen: keyof MainTabParamList };
    UserFeed: undefined;
    UserProfile: { userId: string };
};

export type MainTabParamList = {
    UserFeed: undefined;
    Search: undefined;
    UserProfile: {userId: string};
};
