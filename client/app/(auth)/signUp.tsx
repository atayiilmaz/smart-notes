import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../../utils/api';
import { BaseButton } from '../../components/BaseButton';
import { TextField } from '../../components/TextField';
import { useTranslation } from 'react-i18next';

export default function SignUp() {
    const router = useRouter();
    const { t } = useTranslation();
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
        if (!username) newErrors.username = t('errors.required');
        if (!email) newErrors.email = t('errors.required');
        if (!password) newErrors.password = t('errors.required');
        if (password.length < 6) newErrors.password = t('errors.passwordLength');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await register(username, email, password);
            Alert.alert(t('common.success'), t('auth.signUpSuccess'));
            router.replace('/(auth)/signIn');
        } catch (e: any) {
            Alert.alert(t('common.error'), e.message || t('errors.unknownError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Smart Notes</Text>
            </View>
            <View style={styles.content}>
                <TextField
                    label={t('auth.username')}
                    value={username}
                    onChangeText={setUsername}
                    placeholder={t('auth.username')}
                    autoCapitalize="none"
                    error={errors.username}
                />

                <TextField
                    label={t('auth.email')}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />

                <TextField
                    label={t('auth.password')}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.password')}
                    secureTextEntry
                    error={errors.password}
                />

                <BaseButton
                    title={t('auth.signUp')}
                    onPress={handleSignUp}
                    loading={loading}
                    style={styles.button}
                />

                <BaseButton
                    title={t('auth.haveAccount')}
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
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
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
