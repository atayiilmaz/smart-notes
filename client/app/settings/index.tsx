import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BaseButton } from '../../components/BaseButton';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const handleSignOut = () => {
        Alert.alert(
            t('settings.signOut'),
            t('settings.signOutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: () => {
                        router.replace('/(auth)/signIn');
                    },
                },
            ]
        );
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'tr' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <BaseButton
                    title={`${t('settings.language')}: ${i18n.language === 'en' ? 'English' : 'Türkçe'}`}
                    onPress={toggleLanguage}
                    variant="outline"
                    style={styles.button}
                    icon={<Ionicons name="language" size={24} color="#007AFF" />}
                />
            </View>

            <View style={styles.section}>
                <BaseButton
                    title={t('settings.signOut')}
                    onPress={handleSignOut}
                    variant="outline"
                    style={StyleSheet.flatten([styles.button, styles.signOutButton])}
                    textColor="#FF3B30"
                    icon={<Ionicons name="log-out-outline" size={24} color="#FF3B30" />}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    section: {
        marginBottom: 24,
    },
    button: {
        marginBottom: 12,
    },
    signOutButton: {
        borderColor: '#FF3B30',
    },
}); 