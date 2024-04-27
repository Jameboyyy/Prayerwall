import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth'
import { useNavigation } from '@react-navigation/native';
import { firebaseUser, RootParamList, MainScreenParamList } from '../types/types'
import { StackNavigationProp } from '@react-navigation/stack';

export type CombinedParamList = RootParamList & MainScreenParamList;

const Auth = () => {
    const navigation = useNavigation<StackNavigationProp<CombinedParamList, 'Auth'>>();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = () => {
        auth().createUserWithEmailAndPassword(email, password)
            .then(userCredentials => {
                const user: firebaseUser = {
                    uid: userCredentials.user.uid,
                    email: userCredentials.user.email,
                    displayName: userCredentials.user.displayName,
                };
                console.log('User account created & signed in!');
                navigation.navigate('Account', { user: user });  // Make sure 'Account' expects a parameter
            })
            .catch(error => {
                console.error(error);
            });
    };
    
    const handleLogin = () => {
        auth().signInWithEmailAndPassword(email, password)
            .then(userCredentials => {
                const user: firebaseUser = {
                    uid: userCredentials.user.uid,
                    email: userCredentials.user.email,
                    displayName: userCredentials.user.displayName
                };
                console.log('User logged in!');
                navigation.navigate('UserFeed');  // Assuming 'UserFeed' does not expect any parameters
            })
            .catch(error => {
                console.error(error);
            });
    };

    

    return (
        <View style={styles.container}>
            <View style={styles.title_container}>
                <Text style={styles.title}>Prayerwall</Text>
                <Image
                    style={styles.logo}
                    source={require('../assets/logo.png')}
                />
            </View>
            <View style={styles.fullWidthContainer}>
                <Text style={styles.label}>Email</Text>
            </View>
            <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="email"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={styles.fullWidthContainer}>
                <Text style={styles.label}>Password</Text>
            </View>
            <TextInput
                style={styles.input}
                onChangeText={setPassword}
                value={password}
                placeholder="password"
                secureTextEntry={true}
            />
            {isSignUp ? (
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.sub_button}>{isSignUp ? "Have an account already? Log In!" : "Don't have an account? Sign Up!"}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#d2e7d6',
        alignItems: 'center',
        padding: 20,
    },
    title_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    fullWidthContainer: {
        alignSelf: 'stretch',
        marginTop: 20
    },
    logo: {
        width: 50,
        height: 100,
    },
    title: {
        fontSize: 48,
        color: '#3a506b',
        fontFamily: 'JosefinSans-Regular'
    },
    label: {
        color: 'black',
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'JosefinSans-Regular'
    },
    input: {
        width: '100%', // Adjust this if necessary
        height: 50,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: 'white',
        borderRadius: 5,
        fontFamily: 'JosefinSans-Regular'
    },
    button: {
        backgroundColor: '#3a506b',
        width: '100%',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 30,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'JosefinSans-Regular'
    },
    sub_button: {
        marginTop: 10,
        fontFamily: 'JosefinSans-Regular'
    }
});

export default Auth;
