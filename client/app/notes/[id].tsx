import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Note } from '../../utils/api';
import { getToken } from '../../utils/storage';
import { getNoteById, updateNote, deleteNote, summarizeNote } from '../../utils/api';
import { BaseButton } from '../../components/BaseButton';
import { TextField } from '../../components/TextField';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

export default function NoteDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

    useEffect(() => {
        if (id) {
            fetchNote();
        }
    }, [id]);

    const fetchNote = async () => {
        if (!id) return;
        
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/(auth)/signIn');
                return;
            }
            const fetchedNote = await getNoteById(id, token);
            setNote(fetchedNote);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to fetch note');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!note) return false;
        const newErrors: { title?: string; content?: string } = {};
        if (!note.title) newErrors.title = 'Title is required';
        if (!note.content) newErrors.content = 'Content is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!note || !validateForm() || !note._id) return;

        setSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/(auth)/signIn');
                return;
            }
            const updatedNote = await updateNote(token, note._id, {
                title: note.title,
                content: note.content,
                summary: note.summary || '',
            });
            setNote(updatedNote);
            Alert.alert('Success', 'Note updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update note');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!note?._id) return;

        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            if (!token) {
                                router.replace('/(auth)/signIn');
                                return;
                            }
                            await deleteNote(token, note._id as string);
                            router.back();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete note');
                        }
                    },
                },
            ]
        );
    };

    const handleSummarize = async () => {
        if (!note?.content) {
            Alert.alert('Error', 'Please enter some content first');
            return;
        }

        setSummarizing(true);
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/(auth)/signIn');
                return;
            }
            const result = await summarizeNote(token, note.content);
            const updatedNote = await updateNote(token, note._id!, {
                ...note,
                summary: result.summary
            });
            setNote(updatedNote);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to summarize note');
        } finally {
            setSummarizing(false);
        }
    };

    if (loading || !note) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <BaseButton title="Back" onPress={() => router.back()} variant="outline" />
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <TextField
                    label="Title"
                    value={note.title}
                    onChangeText={(text) => setNote({ ...note, title: text })}
                    placeholder="Enter note title"
                    error={errors.title}
                />

                <TextField
                    label="Content"
                    value={note.content}
                    onChangeText={(text) => setNote({ ...note, content: text })}
                    placeholder="Enter note content"
                    multiline
                    numberOfLines={12}
                    textAlignVertical="top"
                    error={errors.content}
                    style={styles.contentInput}
                />

                <BaseButton
                    title={summarizing ? "Summarizing..." : "Summarize with AI"}
                    onPress={handleSummarize}
                    disabled={summarizing}
                    variant="secondary"
                    style={styles.button}
                />

                {note.summary ? (
                    <View style={styles.summaryContainer}>
                        <TextField
                            label="Summary"
                            value={note.summary}
                            onChangeText={(text) => setNote({ ...note, summary: text })}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                ) : null}

                <BaseButton
                    title={saving ? "Saving..." : "Save Changes"}
                    onPress={handleSave}
                    loading={saving}
                    style={styles.button}
                />

                <BaseButton
                    title="Delete Note"
                    onPress={handleDelete}
                    variant="outline"
                    style={StyleSheet.flatten([styles.button, styles.deleteButton])}
                    textColor="#FF3B30"
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
    },
    contentInput: {
        minHeight: 200,
        paddingTop: 12,
        paddingBottom: 12,
    },
    button: {
        marginBottom: 16,
    },
    deleteButton: {
        borderColor: '#FF3B30',
    },
    summaryContainer: {
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 