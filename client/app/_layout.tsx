import { Stack } from "expo-router";
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getToken, removeToken } from '../utils/storage';
import { handleNetworkChange, syncNotes } from '../utils/sync';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import '../utils/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from '../utils/i18n';
import { useTranslation } from 'react-i18next';

function RootLayoutContent() {
    const router = useRouter();
    const { t } = useTranslation();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await getToken();
            if (!token) {
                router.replace('/(auth)/signIn');
            }
        };

        checkAuth();
        handleNetworkChange(syncNotes);
    }, []);

    useEffect(() => {
        // Set up network change listener for sync
        // Note: Sync will be managed by the notes screen
        const unsubscribe = handleNetworkChange(() => {
            // Sync will be managed by the notes screen
        });

        return () => unsubscribe();
    }, []);

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTintColor: '#000',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="(auth)/signIn"
                options={{
                    title: t('auth.signIn'),
                }}
            />
            <Stack.Screen
                name="(auth)/signUp"
                options={{
                    title: t('auth.signUp'),
                }}
            />
            <Stack.Screen
                name="notes/index"
                options={{
                    title: t('notes.title'),
                }}
            />
            <Stack.Screen
                name="notes/create"
                options={{
                    title: t('notes.create'),
                }}
            />
            <Stack.Screen
                name="notes/[id]"
                options={{
                    title: t('notes.edit'),
                }}
            />
            <Stack.Screen
                name="settings/index"
                options={{
                    title: t('settings.title'),
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <I18nextProvider i18n={i18n}>
            <RootLayoutContent />
        </I18nextProvider>
    );
}