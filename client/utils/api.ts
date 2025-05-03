import axios from "axios";
import { addToSyncQueue, isOnline, saveNote, getAllNotes, getNote, saveToken, getToken, removeToken } from './storage';

const API_URL = 'http://192.168.1.115:3000/api';

// Axios instance conf
const instance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token management
const setAuthToken = async (token: string | null) => {
    if (token) {
        await saveToken(token);
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        await removeToken();
        delete instance.defaults.headers.common['Authorization'];
    }
};

instance.interceptors.request.use(
    async (config) => {
        try {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            console.error('Error getting token:', error);
            return config;
        }
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token geçersiz veya süresi dolmuş
            await setAuthToken(null);
            // Kullanıcıyı login sayfasına yönlendir
            console.log('Session expired, please login again');
        }
        return Promise.reject(error);
    }
);

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
        await setAuthToken(res.data.token);
        return res.data;
    } catch (error) {
        throw axiosErrorToString(error, "Login failed");
    }
};

export const logout = async () => {
    await setAuthToken(null);
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
    const online = await isOnline();
    
    if (!online) {
        return getAllNotes();
    }

    try {
        const response = await instance.get('/notes');
        const notes = response.data.data.map((note: any) => ({
            ...note,
            _id: note._id || note.id,
            id: undefined,
            isLocal: false,
            isSynced: true
        }));

        // Save fetched notes to local storage
        for (const note of notes) {
            await saveNote(note);
        }

        return notes;
    } catch (error) {
        console.error('Error fetching notes:', error);
        // Return local notes if API request fails
        return getAllNotes();
    }
};

export const getNoteById = async (id: string, token: string): Promise<Note> => {
    const online = await isOnline();
    
    if (!online) {
        const localNote = await getNote(id);
        if (!localNote) {
            throw new Error('Note not found in local storage');
        }
        return localNote;
    }

    try {
        const response = await instance.get(`/notes/${id}`);
        const note = {
            ...response.data,
            _id: response.data._id || response.data.id,
            id: undefined,
            isLocal: false,
            isSynced: true
        };
        await saveNote(note);
        return note;
    } catch (error) {
        const localNote = await getNote(id);
        if (!localNote) {
            throw axiosErrorToString(error, "Failed to fetch note");
        }
        return localNote;
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
        const response = await instance.post('/notes', note);
        const createdNote = {
            ...response.data,
            _id: response.data._id || response.data.id,
            id: undefined,
            isLocal: false,
            isSynced: true
        };
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
        const response = await instance.patch(`/notes/${id}`, note);
        const updatedNote = {
            ...response.data,
            _id: response.data._id || response.data.id,
            id: undefined,
            isLocal: false,
            isSynced: true,
            summary: response.data.summary || note.summary || ''
        };
        await saveNote(updatedNote);
        return updatedNote;
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
        await instance.delete(`/notes/${id}`);
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
        const response = await instance.post('/summarize', { text });
        return response.data;
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
