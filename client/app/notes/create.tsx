import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createNote, summarizeNote, Note } from '../../utils/api';
import { getToken, isOnline } from '../../utils/storage';
import { BaseButton } from '../../components/BaseButton';
import { TextField } from '../../components/TextField';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function CreateNote() {
    const router = useRouter();
    const { t } = useTranslation();
    const [note, setNote] = useState<Partial<Note>>({ title: '', content: '' });
    const [summary, setSummary] = useState('');
    const [saving, setSaving] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        const connected = await isOnline();
        setIsConnected(connected);
    };

    const validateForm = () => {
        const newErrors: { title?: string; content?: string } = {};
        if (!note.title) newErrors.title = t('errors.required');
        if (!note.content) newErrors.content = t('errors.required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/(auth)/signIn');
                return;
            }
            const createdNote = await createNote(token, {
                title: note.title || '',
                content: note.content || '',
            });
            if (isConnected) {
                Alert.alert(t('common.success'), t('notes.createSuccess'));
            } else {
                Alert.alert(t('common.success'), t('notes.createSuccessOffline'));
            }
            router.back();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
        } finally {
            setSaving(false);
        }
    };

    const handleSummarize = async () => {
        if (!note.content) {
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
            const result = await summarizeNote(token, note.content || '');
            setSummary(result.summary);
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
        } finally {
            setSummarizing(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {!isConnected && (
                <View style={styles.offlineBanner}>
                    <Text style={styles.offlineText}>{t('common.offlineMode')}</Text>
                </View>
            )}

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

                {summary ? (
                    <View style={styles.summaryContainer}>
                        <TextField
                            label={t('notes.summary')}
                            value={summary}
                            onChangeText={setSummary}
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
    contentInput: {
        minHeight: 200,
    },
    button: {
        marginTop: 16,
    },
    summaryContainer: {
        marginTop: 16,
    },
    offlineBanner: {
        backgroundColor: '#FFD700',
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    offlineText: {
        color: '#000',
        textAlign: 'center',
    },
}); 