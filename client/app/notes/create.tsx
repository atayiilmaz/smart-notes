import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createNote, summarizeNote } from '../../utils/api';
import { getToken } from '../../utils/storage';
import { BaseButton } from '../../components/BaseButton';
import { TextField } from '../../components/TextField';

export default function CreateNote() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

    const validateForm = () => {
        const newErrors: { title?: string; content?: string } = {};
        if (!title) newErrors.title = 'Title is required';
        if (!content) newErrors.content = 'Content is required';
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
            Alert.alert('Error', error.message || 'Failed to create note');
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async () => {
        if (!content) {
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
            const result = await summarizeNote(token, content);
            setSummary(result.summary);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to summarize note');
        } finally {
            setSummarizing(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <TextField
                    label="Title"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter note title"
                    error={errors.title}
                />

                <TextField
                    label="Content"
                    value={content}
                    onChangeText={setContent}
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

                {summary ? (
                    <View style={styles.summaryContainer}>
                        <TextField
                            label="Summary"
                            value={summary}
                            onChangeText={setSummary}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                ) : null}

                <BaseButton
                    title="Create Note"
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
    summaryContainer: {
        marginBottom: 16,
    },
}); 