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
import { useTranslation } from 'react-i18next';

export default function NoteDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t } = useTranslation();
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
            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!note) return false;
        const newErrors: { title?: string; content?: string } = {};
        if (!note.title) newErrors.title = t('errors.required');
        if (!note.content) newErrors.content = t('errors.required');
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
            Alert.alert(t('common.success'), t('notes.updateSuccess'));
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!note?._id) return;

        Alert.alert(
            t('notes.delete'),
            t('notes.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.confirm'),
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
                            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
                        }
                    },
                },
            ]
        );
    };

    const handleSummarize = async () => {
        if (!note?.content) {
            Alert.alert(t('common.error'), t('errors.required'));
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
            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
        } finally {
            setSummarizing(false);
        }
    };

    if (loading || !note) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <BaseButton title={t('common.back')} onPress={() => router.back()} variant="outline" />
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <TextField
                    label={t('notes.title')}
                    value={note.title}
                    onChangeText={(text) => setNote({ ...note, title: text })}
                    placeholder={t('notes.titlePlaceholder')}
                    error={errors.title}
                />

                <TextField
                    label={t('notes.content')}
                    value={note.content}
                    onChangeText={(text) => setNote({ ...note, content: text })}
                    placeholder={t('notes.contentPlaceholder')}
                    multiline
                    numberOfLines={12}
                    textAlignVertical="top"
                    error={errors.content}
                    style={styles.contentInput}
                />

                <BaseButton
                    title={summarizing ? t('notes.summarizing') : t('notes.summarize')}
                    onPress={handleSummarize}
                    disabled={summarizing}
                    variant="secondary"
                    style={styles.button}
                />

                {note.summary ? (
                    <View style={styles.summaryContainer}>
                        <TextField
                            label={t('notes.summary')}
                            value={note.summary}
                            onChangeText={(text) => setNote({ ...note, summary: text })}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                ) : null}

                <BaseButton
                    title={saving ? t('notes.saving') : t('notes.save')}
                    onPress={handleSave}
                    loading={saving}
                    style={styles.button}
                />

                <BaseButton
                    title={t('notes.delete')}
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
        backgroundColor: '#F2F2F7',
    },
    content: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentInput: {
        minHeight: 200,
    },
    button: {
        marginTop: 16,
    },
    deleteButton: {
        borderColor: '#FF3B30',
    },
    summaryContainer: {
        marginTop: 16,
    },
}); 