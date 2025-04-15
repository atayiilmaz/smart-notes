import NetInfo from '@react-native-community/netinfo';

/**
 * Listen for network status changes and run a callback when online.
 * Returns an unsubscribe function.
 */
export function onNetworkReconnect(callback: () => void): () => void {
    const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
            callback();
        }
    });
    return unsubscribe;
}

/**
 * Get current connection status.
 */
export async function isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return !!state.isConnected;
}
