import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../../utils/api';
import { BaseButton } from '../../components/BaseButton';
import { TextField } from '../../components/TextField';

export default function SignUp() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        username?: string;
        email?: string;
        password?: string;
    }>({});

    const validateForm = () => {
        const newErrors: {
            username?: string;
            email?: string;
            password?: string;
        } = {};
        if (!username) newErrors.username = 'Username is required';
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await register(username, email, password);
            Alert.alert('Success', 'Account created! Please sign in.');
            router.replace('/(auth)/signIn');
        } catch (e: any) {
            Alert.alert('Sign Up Failed', e.message || 'Registration error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TextField
                    label="Username"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                    autoCapitalize="none"
                    error={errors.username}
                />

                <TextField
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />

                <TextField
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    error={errors.password}
                />

                <BaseButton
                    title="Sign Up"
                    onPress={handleSignUp}
                    loading={loading}
                    style={styles.button}
                />

                <BaseButton
                    title="Already have an account? Sign In"
                    onPress={() => router.push('/(auth)/signIn')}
                    variant="outline"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    button: {
        marginBottom: 16,
    },
});
