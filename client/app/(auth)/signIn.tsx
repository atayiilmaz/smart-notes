import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../../utils/api';
import { saveToken } from '../../utils/storage';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async () => {
        setLoading(true);
        try {
            console.log("About to call login API");
            const res = await login(email, password);
            console.log("Login response:", res);
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
            <Text style={styles.header}>Sign In</Text>
            <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <Button title={loading ? 'Signing in...' : 'Sign In'} onPress={handleSignIn} disabled={loading} />
            <Text style={styles.link} onPress={() => router.push('/(auth)/signUp')}>Don't have an account? Sign Up</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, alignSelf: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
    link: { color: '#007AFF', marginTop: 16, textAlign: 'center' },
});
