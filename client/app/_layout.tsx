import { Stack } from "expo-router";
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getToken, removeToken } from '../utils/storage';
import { handleNetworkChange, syncNotes } from '../utils/sync';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
    const router = useRouter();

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
                    fontWeight: '600',
                },
                headerShadowVisible: false,
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
                    title: 'Sign In',
                }}
            />
            <Stack.Screen
                name="(auth)/signUp"
                options={{
                    title: 'Sign Up',
                }}
            />
            <Stack.Screen
                name="notes/index"
                options={{
                    title: 'All Notes',
                    headerRight: () => (
                        <TouchableOpacity 
                            onPress={async () => {
                                await removeToken();
                                router.replace('/(auth)/signIn');
                            }}
                            style={{ marginRight: 16 }}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#007AFF" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="notes/create"
                options={{
                    title: 'Create Note',
                }}
            />
            <Stack.Screen
                name="notes/[id]"
                options={{
                    title: 'Note Details',
                }}
            />
            <Stack.Screen
                name="settings/index"
                options={{
                    title: 'Settings',
                }}
            />
        </Stack>
    );
}