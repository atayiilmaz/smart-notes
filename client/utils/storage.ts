import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Note } from './api';

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
