import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Note } from '../utils/api';
import { format } from 'date-fns';

interface NoteCardProps {
    note: Note;
    onPress: () => void;
    style?: ViewStyle;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, style }) => {
    const date = note.updatedAt ? new Date(note.updatedAt) : new Date(note.createdAt);
    const dateLabel = note.updatedAt ? 'Modified' : 'Created';
    
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                    {note.title}
                </Text>
                {note.isLocal && (
                    <View style={styles.offlineBadge}>
                        <Text style={styles.offlineText}>Offline</Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.content} numberOfLines={3}>
                {note.content}
            </Text>

            {note.summary && (
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Summary:</Text>
                    <Text style={styles.summaryText} numberOfLines={2}>
                        {note.summary}
                    </Text>
                </View>
            )}

            <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>{dateLabel}:</Text>
                <Text style={styles.date}>
                    {format(date, 'MMM d, yyyy h:mm a')}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    offlineBadge: {
        backgroundColor: '#E5E5EA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 8,
    },
    offlineText: {
        fontSize: 12,
        color: '#8E8E93',
    },
    content: {
        fontSize: 16,
        color: '#3A3A3C',
        marginBottom: 8,
        lineHeight: 22,
    },
    summaryContainer: {
        backgroundColor: '#F2F2F7',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 4,
    },
    summaryText: {
        fontSize: 14,
        color: '#3A3A3C',
        fontStyle: 'italic',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginRight: 4,
    },
    date: {
        fontSize: 12,
        color: '#8E8E93',
    },
}); 