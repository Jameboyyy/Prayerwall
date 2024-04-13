
import Backendless from 'backendless';
import { CustomUser } from './userTypes';

export const login = async (email: string, password: string): Promise<CustomUser | null> => {
  try {
    return await Backendless.UserService.login(email, password, true) as CustomUser;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (email: string, password: string, firstName: string, lastName: string, username: string): Promise<CustomUser> => {
  const newUser = new Backendless.User() as CustomUser;
  newUser.email = email;
  newUser.password = password;
  newUser.firstName = firstName;
  newUser.lastName = lastName;
  newUser.username = username;

  return await Backendless.UserService.register(newUser) as CustomUser;
};

export const getCurrentUser = async (): Promise<CustomUser | null> => {
  try {
    const user = await Backendless.UserService.getCurrentUser();
    return user as CustomUser;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};
