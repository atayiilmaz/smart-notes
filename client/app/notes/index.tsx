import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Note } from '../../utils/api';
import { getToken } from '../../utils/storage';
import { getNotes } from '../../utils/api';
import { NoteCard } from '../../components/NoteCard';
import { BaseButton } from '../../components/BaseButton';
import { syncNotes } from '../../utils/sync';
import { Ionicons } from '@expo/vector-icons';

export default function Notes() {
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotes = async () => {
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/(auth)/signIn');
                return;
            }
            const fetchedNotes = await getNotes(token);
            setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : []);
            setFilteredNotes(Array.isArray(fetchedNotes) ? fetchedNotes : []);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch notes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredNotes(notes);
        } else {
            const filtered = notes.filter(note => 
                note.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredNotes(filtered);
        }
    }, [searchQuery, notes]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await syncNotes();
        await fetchNotes();
    };

    const handleNotePress = (note: Note) => {
        if (note._id) {
            router.push(`/notes/${note._id}` as any);
        }
    };

    const handleCreateNote = () => {
        router.push('/notes/create' as any);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={24} color="#007AFF" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredNotes}
                renderItem={({ item }) => (
                    <NoteCard
                        note={item}
                        onPress={() => handleNotePress(item)}
                        style={styles.noteCard}
                    />
                )}
                keyExtractor={(item) => item._id || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <BaseButton
                            title="Create Your First Note"
                            onPress={handleCreateNote}
                        />
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={handleCreateNote}>
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        padding: 16,
    },
    searchBar: {
        height: 40,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    noteCard: {
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});