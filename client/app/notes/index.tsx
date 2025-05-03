import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Note } from '../../utils/api';
import { getToken, isOnline } from '../../utils/storage';
import { getNotes } from '../../utils/api';
import { NoteCard } from '../../components/NoteCard';
import { BaseButton } from '../../components/BaseButton';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TextField } from '../../components/TextField';

export default function NotesList() {
    const router = useRouter();
    const { t } = useTranslation();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchNotes();
        checkConnection();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchNotes();
        }, [])
    );

    const checkConnection = async () => {
        const connected = await isOnline();
        setIsConnected(connected);
    };

    const fetchNotes = async () => {
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/(auth)/signIn');
                return;
            }
            const fetchedNotes = await getNotes(token);
            setNotes(fetchedNotes);
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotes();
    };

    const handleCreateNote = () => {
        router.push('/notes/create');
    };

    const handleSettings = () => {
        router.push('/settings');
    };

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderNote = ({ item }: { item: Note }) => (
        <NoteCard
            note={item}
            onPress={() => router.push(`/notes/${item._id}`)}
            isOffline={!isConnected}
        />
    );

    return (
        <View style={styles.container}>
            {!isConnected && (
                <View style={styles.offlineBanner}>
                    <Text style={styles.offlineText}>{t('common.offlineMode')}</Text>
                </View>
            )}

            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <TextField
                        placeholder={t('notes.search')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        leftIcon={<Ionicons name="search" size={20} color="#8E8E93" />}
                    />
                </View>
                <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
                    <Ionicons name="settings-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredNotes}
                renderItem={renderNote}
                keyExtractor={(item) => item._id || ''}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('notes.empty')}</Text>
                        </View>
                    ) : null
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    searchContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    searchInput: {
        height: 40,
        fontSize: 16,
        margin: 0,
        padding: 0,
    },
    settingsButton: {
        padding: 6,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    offlineBanner: {
        backgroundColor: '#FFD700',
        padding: 8,
        borderRadius: 8,
        margin: 16,
    },
    offlineText: {
        color: '#000',
        textAlign: 'center',
    },
});