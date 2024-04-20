import Backendless from 'backendless';

export interface CustomUser extends Backendless.User {
    ownerId?: string;
    email?: string; 
    password?: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    profilePicture: string;
  }
  