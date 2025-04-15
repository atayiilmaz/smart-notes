import { Stack } from "expo-router";

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getToken } from '../utils/storage';
import { onNetworkReconnect } from '../utils/network';
import { syncNotes } from '../utils/sync';

export default function RootLayout() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to sign in if not authenticated
        (async () => {
            const token = await getToken();
            if (token) {
                router.replace('/notes');
            } else {
                router.replace('/(auth)/signIn');
            }
        })();
        // Automatically sync notes when network reconnects
        const unsubscribe = onNetworkReconnect(() => {
            syncNotes();
        });
        return () => unsubscribe();
    }, []);
    return <Stack />;
}