import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Backendless from 'backendless';
import { StackNavigationProp } from '@react-navigation/stack';

type AuthStackParamList = {
    UserFeed: undefined;
    Account: { userId: string };
};

type AuthMode = 'login' | 'signup';

interface UserForm {
    email: string;
    password: string;
}

interface AuthProps {
    navigation: StackNavigationProp<AuthStackParamList, 'UserFeed' | 'Account'>;
}

const Auth: React.FC<AuthProps> = ({ navigation }) => {
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [form, setForm] = useState<UserForm>({ email: '', password: '' });

    const handleInputChange = (name: keyof UserForm, value: string) => {
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async () => {
        if (!form.email || !form.password) {
            Alert.alert('Error', 'Please fill all fields.');
            return;
        }

        try {
            let user;
            if (authMode === 'login') {
                user = await Backendless.UserService.login(form.email, form.password, true);
            } else {
                const newUser = new Backendless.User();
                newUser.email = form.email;
                newUser.password = form.password;
                newUser.firstName = "Initial"
                newUser.lastName = 'User';

                const registeredUser = await Backendless.UserService.register(newUser) as CustomUser;

                user = await Backendless.UserService.register(newUser);
            }

            console.log('User logged in/registered:', user);
            // Check if the user has completed their profile
            if (user.username && user.firstName && user.lastName) {
                navigation.navigate('UserFeed');
            } else {
                navigation.navigate('Account', { userId: user.objectId });
            }
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Error', 'An unexpected error occurred');
            }
        }
    };

    const switchMode = () => {
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.title_container}>
                <Text style={styles.title}>Prayerwall</Text>
                <Image source={require('../assets/pw_logo.png')} style={styles.logo} />
            </View>
            <View style={styles.form_container}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(value) => handleInputChange('email', value)}
                    value={form.email}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#a9a9a9"
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(value) => handleInputChange('password', value)}
                    value={form.password}
                    placeholder="Password"
                    secureTextEntry
                    placeholderTextColor="#a9a9a9"
                />
                <TouchableOpacity
                    style={styles.auth_btn}
                    onPress={handleSubmit}
                    disabled={form.email === '' || form.password === ''}
                >
                    <Text style={styles.auth_btn_text}>{authMode === 'login' ? 'Login' : 'Sign Up'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.switch_btn}
                    onPress={switchMode}
                >
                    <Text style={styles.switch_btn_text}>
                        {authMode === 'login' ? "Don't have an account? Sign Up" : "Have an account already? Log In"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        alignItems: 'center',
        backgroundColor: '#d2e7d6',
    },
    title_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '25%',
    },
    title: {
        fontSize: 32,
        color: '#3a506b',
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'JosefinSans-Bold',
    },
    logo: {
        width: 40,
        height: 100,
    },
    form_container: {
        width: '100%',
        alignItems: 'center',
        padding: 12
    },
    label: {
        marginTop: 25,
        fontSize: 16,
        fontFamily: 'JosefinSans-Regular',
    },
    input: {
        backgroundColor: '#ffffff',
        width: 327,
        height: 50,
        borderRadius: 2,
        padding: 10,
        marginBottom: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: 'gray',
        color: '#a9a9a9',
        fontFamily: 'JosefinSans-Regular',
    },
    auth_btn: {
        backgroundColor: '#3a506b',
        width: 327,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        marginTop: 25,
    },
    auth_btn_text: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'JosefinSans-Italic'
    },
    switch_btn: {
        marginTop: 10
    },
    switch_btn_text: {
        color: '#000000',
        fontFamily: 'JosefinSans-Regular',
        fontSize: 14,
        textAlign: 'right'
    }
});

export default Auth;
