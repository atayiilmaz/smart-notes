import { createNote, updateNote, deleteNote } from './api';
import { getToken } from './storage';
import { getSyncQueue, clearSyncQueue, getLocalNotes, updateLocalNote } from './storage';
import { isOnline } from './storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Sync local notes with backend when online.
 * - Pulls latest notes from backend and updates local cache.
 * - Optionally, you can push local changes to backend (advanced: conflict resolution).
 */
export const syncNotes = async (): Promise<void> => {
    try {
        const isConnected = await isOnline();
        if (!isConnected) {
            console.log('No internet connection. Sync will be attempted later.');
            return;
        }

        const token = await getToken();
        if (!token) {
            console.log('No authentication token. Sync will be attempted later.');
            return;
        }

        const queue = await getSyncQueue();
        if (queue.length === 0) {
            return;
        }

        for (const item of queue) {
            try {
                switch (item.action) {
                    case 'create':
                        const createdNote = await createNote(token, item.note);
                        await updateLocalNote(item.note._id!, { 
                            _id: createdNote._id,
                            isLocal: false,
                            isSynced: true 
                        });
                        break;
                    case 'update':
                        await updateNote(token, item.note._id!, item.note);
                        await updateLocalNote(item.note._id!, { isSynced: true });
                        break;
                    case 'delete':
                        await deleteNote(token, item.note._id!);
                        break;
                }
            } catch (error) {
                console.error(`Error syncing ${item.action} action:`, error);
                // Continue with next item in queue
            }
        }

        await clearSyncQueue();
    } catch (error) {
        console.error('Error during sync:', error);
    }
};

export const handleNetworkChange = (callback: () => void): (() => void) => {
    const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
            callback();
        }
    });
    return unsubscribe;
};
