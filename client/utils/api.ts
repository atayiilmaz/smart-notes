import axios from "axios";

const API = "http://192.168.1.104:3000/api";

const instance = axios.create({
    baseURL: API
});

// --- Types ---
export interface Note {
    id?: string;
    _id?: string;
    title: string;
    content: string;
    summary?: string;
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
export async function getNotes(token: string): Promise<Note[]> {
    try {
        const res = await instance.get("/notes", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.data;
    } catch (error) {
        throw axiosErrorToString(error, "Failed to fetch notes");
    }
}

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

export async function createNote(note: Omit<Note, "id">, token: string): Promise<Note> {
    try {
        const res = await instance.post(`/notes`, note, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        throw axiosErrorToString(error, "Failed to create note");
    }
}

export async function updateNote(id: string, note: Partial<Note>, token: string): Promise<Note> {
    try {
        const res = await instance.patch(`/notes/${id}`, note, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        throw axiosErrorToString(error, "Failed to update note");
    }
}

export async function deleteNote(id: string, token: string): Promise<void> {
    try {
        await instance.delete(`/notes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        throw axiosErrorToString(error, "Failed to delete note");
    }
}

export async function saveNotes(notes: Note[]): Promise<void> {
    try {
        await instance.post("/notes/bulk", { notes });
    } catch (error) {
        throw axiosErrorToString(error, "Failed to sync notes");
    }
}

// --- Summarization ---
export async function summarize(text: string): Promise<string> {
    try {
        const res = await instance.post("/summarize", { text });
        return res.data.summary;
    } catch (error) {
        throw axiosErrorToString(error, "Failed to summarize");
    }
}

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
