import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { Note } from './api';

const NOTES_KEY = '@smart_notes:notes';
const SYNC_QUEUE_KEY = '@smart_notes:sync_queue';

// --- Notes ---
export async function getAllNotes(): Promise<Note[]> {
    const json = await AsyncStorage.getItem('notes');
    return json ? JSON.parse(json) : [];
}

export async function getNote(id: string): Promise<Note | undefined> {
    const notes = await getAllNotes();
    return notes.find(n => n.id === id);
}

export async function saveNote(note: Note): Promise<void> {
    const notes = await getAllNotes();
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) notes[idx] = note;
    else notes.push(note);
    await AsyncStorage.setItem('notes', JSON.stringify(notes));
}

export async function deleteNote(id: string): Promise<void> {
    const notes = await getAllNotes();
    const filtered = notes.filter(n => n.id !== id);
    await AsyncStorage.setItem('notes', JSON.stringify(filtered));
}

// --- Token ---
export async function saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem('token', token);
}

export async function getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
}

export async function removeToken(): Promise<void> {
    await AsyncStorage.removeItem('token');
}

export const saveNoteLocally = async (note: Note): Promise<void> => {
    try {
        const existingNotes = await getLocalNotes();
        const newNote = {
            ...note,
            isLocal: true,
            isSynced: false,
            _id: note._id || Date.now().toString(),
        };
        
        const updatedNotes = [...existingNotes, newNote];
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
        console.error('Error saving note locally:', error);
        throw error;
    }
};

export const getLocalNotes = async (): Promise<Note[]> => {
    try {
        const notes = await AsyncStorage.getItem(NOTES_KEY);
        return notes ? JSON.parse(notes) : [];
    } catch (error) {
        console.error('Error getting local notes:', error);
        return [];
    }
};

export const updateLocalNote = async (noteId: string, updates: Partial<Note>): Promise<void> => {
    try {
        const notes = await getLocalNotes();
        const updatedNotes = notes.map(note => 
            note._id === noteId ? { ...note, ...updates, isSynced: false } : note
        );
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
        console.error('Error updating local note:', error);
        throw error;
    }
};

export const deleteLocalNote = async (noteId: string): Promise<void> => {
    try {
        const notes = await getLocalNotes();
        const updatedNotes = notes.filter(note => note._id !== noteId);
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
        console.error('Error deleting local note:', error);
        throw error;
    }
};

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

export const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
};
