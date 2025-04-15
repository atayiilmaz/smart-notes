import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../../utils/api';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async () => {
        setLoading(true);
        try {
            await register(username, email, password);
            Alert.alert('Success', 'Account created! Please sign in.');
            router.replace('/(auth)/signIn');
        } catch (e: any) {
            Alert.alert('Sign Up Failed', e.message || 'Registration error');
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Sign Up</Text>
            <TextInput style={styles.input} placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <Button title={loading ? 'Signing up...' : 'Sign Up'} onPress={handleSignUp} disabled={loading} />
            <Text style={styles.link} onPress={() => router.push('/(auth)/signIn')}>Already have an account? Sign In</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, alignSelf: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
    link: { color: '#007AFF', marginTop: 16, textAlign: 'center' },
});
