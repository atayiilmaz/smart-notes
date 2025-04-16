import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createNote, summarizeNote } from '../../utils/api';
import { getToken } from '../../utils/storage';
import { BaseButton } from '../../components/BaseButton';
import { TextField } from '../../components/TextField';
import { useTranslation } from 'react-i18next';

export default function CreateNote() {
    const router = useRouter();
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

    const validateForm = () => {
        const newErrors: { title?: string; content?: string } = {};
        if (!title) newErrors.title = t('errors.required');
        if (!content) newErrors.content = t('errors.required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateNote = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/(auth)/signIn');
                return;
            }
            await createNote(token, { title, content, summary });
            router.replace({
                pathname: '/notes',
                params: { refresh: 'true' }
            });
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async () => {
        if (!content) {
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
            const result = await summarizeNote(token, content);
            setSummary(result.summary);
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('errors.unknownError'));
        } finally {
            setSummarizing(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <TextField
                    label={t('notes.title')}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('notes.titlePlaceholder')}
                    error={errors.title}
                />

                <TextField
                    label={t('notes.content')}
                    value={content}
                    onChangeText={setContent}
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
                    title={t('notes.create')}
                    onPress={handleCreateNote}
                    loading={loading}
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
}); 