import axios from "axios";
import { saveNoteLocally, addToSyncQueue, isOnline } from './storage';

const API_URL = 'http://192.168.1.110:3000/api';

const instance = axios.create({
    baseURL: API_URL
});

// --- Types ---
export interface Note {
    id?: string;
    _id?: string;
    title: string;
    content: string;
    summary?: string;
    isLocal?: boolean;
    isSynced?: boolean;
}

export interface AuthResponse {
    token: string;
}

// --- Auth ---
export async function login(email: string, password: string): Promise<AuthResponse> {
    try {
        const res = await instance.post("/auth/login", { email, password });
        return res.data;
    } catch (error) {
        throw axiosErrorToString(error, "Login failed");
    }
}

export async function register(username: string, email: string, password: string): Promise<any> {
    try {
        const res = await instance.post("/auth/signup", { username, email, password });
        return res.data;
    } catch (error) {
        throw axiosErrorToString(error, "Registration failed");
    }
}

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
        return data.data;
    } catch (error) {
        console.error('Error fetching notes:', error);
        throw error;
    }
};

export async function getNoteById(id: string, token: string): Promise<Note> {
    try {
        const res = await instance.get(`/notes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        throw axiosErrorToString(error, "Failed to fetch note");
    }
}

export const createNote = async (token: string, note: Omit<Note, '_id'>): Promise<Note> => {
    const online = await isOnline();
    
    if (!online) {
        // Save locally and add to sync queue
        await saveNoteLocally(note);
        await addToSyncQueue('create', note as Note);
        return { ...note, _id: Date.now().toString(), isLocal: true, isSynced: false };
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

        return await response.json();
    } catch (error) {
        // If online creation fails, fall back to offline
        await saveNoteLocally(note);
        await addToSyncQueue('create', note as Note);
        return { ...note, _id: Date.now().toString(), isLocal: true, isSynced: false };
    }
};

export const updateNote = async (token: string, id: string, note: Partial<Note>): Promise<Note> => {
    const online = await isOnline();
    
    if (!online) {
        // Save locally and add to sync queue
        await addToSyncQueue('update', { ...note, _id: id } as Note);
        return { ...note, _id: id, isLocal: true, isSynced: false } as Note;
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

        return await response.json();
    } catch (error) {
        // If online update fails, fall back to offline
        await addToSyncQueue('update', { ...note, _id: id } as Note);
        return { ...note, _id: id, isLocal: true, isSynced: false } as Note;
    }
};

export const deleteNote = async (token: string, id: string): Promise<void> => {
    const online = await isOnline();
    
    if (!online) {
        // Add to sync queue for deletion
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
        // If online deletion fails, fall back to offline
        await addToSyncQueue('delete', { _id: id } as Note);
    }
};

export async function saveNotes(notes: Note[]): Promise<void> {
    try {
        await instance.post("/notes/bulk", { notes });
    } catch (error) {
        throw axiosErrorToString(error, "Failed to sync notes");
    }
}

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
