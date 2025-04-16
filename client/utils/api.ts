import axios from "axios";
import { addToSyncQueue, isOnline, saveNote } from './storage';

const API_URL = 'http://192.168.43.139:3000/api';

const instance = axios.create({
    baseURL: API_URL
});

// --- Types ---
export interface Note {
    _id?: string;
    title: string;
    content: string;
    summary?: string;
    isLocal?: boolean;
    isSynced?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    token: string;
}

// --- Auth ---
export const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const res = await instance.post("/auth/login", { email, password });
        return res.data;
    } catch (error) {
        throw axiosErrorToString(error, "Login failed");
    }
};

export const register = async (username: string, email: string, password: string): Promise<any> => {
    try {
        const res = await instance.post("/auth/signup", { username, email, password });
        return res.data;
    } catch (error) {
        throw axiosErrorToString(error, "Registration failed");
    }
};

// --- Notes ---
export const getNotes = async (token: string): Promise<Note[]> => {
    try {
        const response = await fetch(`${API_URL}/notes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notes');
        }

        const data = await response.json();
        return data.data.map((note: any) => ({
            ...note,
            _id: note._id || note.id,
            id: undefined
        }));
    } catch (error) {
        console.error('Error fetching notes:', error);
        throw error;
    }
};

export const getNoteById = async (id: string, token: string): Promise<Note> => {
    try {
        const res = await instance.get(`/notes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const note = res.data;
        return {
            ...note,
            _id: note._id || note.id,
            id: undefined
        };
    } catch (error) {
        throw axiosErrorToString(error, "Failed to fetch note");
    }
};

export const createNote = async (token: string, note: Omit<Note, '_id'>): Promise<Note> => {
    const online = await isOnline();
    
    if (!online) {
        const newNote = { 
            ...note, 
            _id: Date.now().toString(),
            isLocal: true,
            isSynced: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await saveNote(newNote);
        return newNote;
    }

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(note),
        });

        if (!response.ok) {
            throw new Error('Failed to create note');
        }

        const createdNote = await response.json();
        await saveNote(createdNote);
        return createdNote;
    } catch (error) {
        const newNote = { 
            ...note, 
            _id: Date.now().toString(),
            isLocal: true,
            isSynced: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await saveNote(newNote);
        return newNote;
    }
};

export const updateNote = async (token: string, id: string, note: Partial<Note>): Promise<Note> => {
    const online = await isOnline();
    
    if (!online) {
        const updatedNote = { ...note, _id: id, isLocal: true, isSynced: false };
        await saveNote(updatedNote as Note);
        return updatedNote as Note;
    }

    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(note),
        });

        if (!response.ok) {
            throw new Error('Failed to update note');
        }

        const updatedNote = await response.json();
        const formattedNote = {
            ...updatedNote,
            _id: updatedNote._id || updatedNote.id,
            id: undefined,
            summary: updatedNote.summary || note.summary || '' // Ensure summary is preserved
        };
        await saveNote(formattedNote);
        return formattedNote;
    } catch (error) {
        const updatedNote = { ...note, _id: id, isLocal: true, isSynced: false };
        await saveNote(updatedNote as Note);
        return updatedNote as Note;
    }
};

export const deleteNote = async (token: string, id: string): Promise<void> => {
    const online = await isOnline();
    
    if (!online) {
        await addToSyncQueue('delete', { _id: id } as Note);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete note');
        }
    } catch (error) {
        await addToSyncQueue('delete', { _id: id } as Note);
    }
};

// --- Summarization ---
export const summarizeNote = async (token: string, text: string): Promise<{ summary: string }> => {
    const online = await isOnline();
    
    if (!online) {
        throw new Error('Summarization requires an internet connection');
    }

    try {
        const response = await fetch(`${API_URL}/summarize`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error('Failed to summarize note');
        }

        return await response.json();
    } catch (error) {
        console.error('Error summarizing note:', error);
        throw error;
    }
};

// --- Error Helper ---
function axiosErrorToString(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (typeof data === "string") return data;
        if (data?.message) return data.message;
        if (data?.details) return data.details;
        return JSON.stringify(data);
    }
    if (typeof error === "string") return error;
    if (typeof error === "object" && error !== null) return JSON.stringify(error);
    return fallback;
}
