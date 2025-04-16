import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { Note } from './api';

const NOTES_KEY = '@smart_notes:notes';
const SYNC_QUEUE_KEY = '@smart_notes:sync_queue';
const TOKEN_KEY = '@smart_notes:token';

// --- Notes Storage ---
export const getAllNotes = async (): Promise<Note[]> => {
    try {
        const notes = await AsyncStorage.getItem(NOTES_KEY);
        return notes ? JSON.parse(notes) : [];
    } catch (error) {
        console.error('Error getting notes:', error);
        return [];
    }
};

export const getNote = async (id: string): Promise<Note | undefined> => {
    try {
        const notes = await getAllNotes();
        return notes.find(n => n._id === id);
    } catch (error) {
        console.error('Error getting note:', error);
        return undefined;
    }
};

export const saveNote = async (note: Note): Promise<void> => {
    try {
        const notes = await getAllNotes();
        const idx = notes.findIndex(n => n._id === note._id);
        const updatedNote = {
            ...note,
            isLocal: true,
            isSynced: false,
            updatedAt: new Date().toISOString(),
        };
        
        if (idx >= 0) {
            notes[idx] = updatedNote;
        } else {
            notes.push(updatedNote);
        }
        
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
        await addToSyncQueue(idx >= 0 ? 'update' : 'create', updatedNote);
    } catch (error) {
        console.error('Error saving note:', error);
        throw error;
    }
};

export const deleteNote = async (id: string): Promise<void> => {
    try {
        const notes = await getAllNotes();
        const noteToDelete = notes.find(n => n._id === id);
        if (noteToDelete) {
            const filtered = notes.filter(n => n._id !== id);
            await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
            await addToSyncQueue('delete', noteToDelete);
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
};

// --- Token Storage ---
export const saveToken = async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
};

// --- Sync Queue ---
export const addToSyncQueue = async (action: 'create' | 'update' | 'delete', note: Note): Promise<void> => {
    try {
        const queue = await getSyncQueue();
        queue.push({ action, note, timestamp: Date.now() });
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
        console.error('Error adding to sync queue:', error);
        throw error;
    }
};

export const getSyncQueue = async (): Promise<Array<{
    action: 'create' | 'update' | 'delete';
    note: Note;
    timestamp: number;
}>> => {
    try {
        const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        console.error('Error getting sync queue:', error);
        return [];
    }
};

export const clearSyncQueue = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
        console.error('Error clearing sync queue:', error);
        throw error;
    }
};

// --- Network Status ---
export const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
};
