import { getAllNotes, saveNote, getToken } from './storage';
import { getNotes, createNote, updateNote, deleteNote } from './api';
import { isOnline } from './network';

/**
 * Sync local notes with backend when online.
 * - Pulls latest notes from backend and updates local cache.
 * - Optionally, you can push local changes to backend (advanced: conflict resolution).
 */
export async function syncNotes() {
    const online = await isOnline();
    if (!online) return;
    const token = await getToken();
    if (!token) return;

    // Fetch notes from backend and cache locally
    try {
        const remoteNotes = await getNotes(token);
        for (const note of remoteNotes) {
            await saveNote(note);
        }
    } catch (err) {
        // Optionally, handle sync errors (e.g., show notification)
        console.warn('Sync failed:', err);
    }
}
