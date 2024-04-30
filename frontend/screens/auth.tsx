import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Auth = ({ navigation }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const auth = getAuth();

    const handleAuth = () => {
        if (isSignUp) {
            if (password !== confirmPassword) {
                console.log('Passwords do not match');
                return;
            }
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log('Signed up with:', userCredential.user);
                    navigation.navigate('Account');
                })
                .catch((error) => {
                    console.error('Signup error:', error.message);
                });
        } else {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log('Logged in with:', userCredential.user);
                    navigation.navigate('Main');
                })
                .catch((error) => {
                    console.error('Login error:', error.message);
                });
        }
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
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize='none'
            />
            {isSignUp && (
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    autoCapitalize='none'
                />
            )}
            <TouchableOpacity
                style={styles.button}
                onPress={handleAuth}
            >
                <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button_toggle}
                onPress={() => setIsSignUp(!isSignUp)}
            >
                <Text style={styles.buttonText_toggle}>
                    {isSignUp ? 'Have an account? Log In!' : "Don't have an account? Sign Up!"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e7d6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title_container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 48,
        fontFamily: 'JosefinSans-Regular',
        color: '#3a506b',
    },
    logo: {
        width: 50,
        height: 100,
    },
    button: {
        backgroundColor: '#3a506b',
        padding: 10,
        borderRadius: 5,
        width: '85%',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'JosefinSans-Regular',
    },
    input: {
        width: '85%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        backgroundColor: '#fff',
        fontFamily: 'JosefinSans-Regular',
    },
    button_toggle: {
        marginTop: 10,
    },
    buttonText_toggle: {
        fontFamily: 'JosefinSans-Regular',
    }
});

export default Auth;
