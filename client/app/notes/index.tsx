import React, { useEffect, useState } from 'react';
import { Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { removeToken, getToken } from '../../utils/storage';
import { getNotes, Note } from '../../utils/api';

export default function Notes() {
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = await getToken();
                if (!token) {
                    router.replace('/(auth)/signIn');
                    return;
                }
                const fetchedNotes = await getNotes(token);
                setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : []);
            } catch (err: any) {
                setError(err?.message || JSON.stringify(err));
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const handleSignOut = async () => {
        await removeToken();
        router.replace('/(auth)/signIn');
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>Error: {error}</Text>
                <Button title="Sign Out" onPress={handleSignOut} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Notes</Text>
            {notes.length === 0 ? (
                <Text>No notes found.</Text>
            ) : (
                notes.map(note => (
                    <View key={note._id} style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{note.title}</Text>
                        <Text>{note.content}</Text>
                        {note.summary && (
                            <Text style={{ fontStyle: 'italic', marginTop: 4 }}>Summary: {note.summary}</Text>
                        )}
                    </View>
                ))
            )}
            <Button title="Sign Out" onPress={handleSignOut} />
        </ScrollView>
    );
}