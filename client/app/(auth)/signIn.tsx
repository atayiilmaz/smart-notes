import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../../utils/api';
import { saveToken } from '../../utils/storage';
import { BaseButton } from '../../components/BaseButton';
import { TextField } from '../../components/TextField';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignIn = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await login(email, password);
            await saveToken(res.token);
            router.replace('/notes');
        } catch (e: any) {
            Alert.alert('Sign In Failed', e.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
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
                    title="Sign In"
                    onPress={handleSignIn}
                    loading={loading}
                    style={styles.button}
                />

                <BaseButton
                    title="Don't have an account? Sign Up"
                    onPress={() => router.push('/(auth)/signUp')}
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
