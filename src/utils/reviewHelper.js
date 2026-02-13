
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const ACTION_COUNT_KEY = 'user_action_count';
const REVIEW_MILESTONES = [3, 10, 30, 50, 100]; // Ask on 3rd, 10th, etc. success

export const checkAndRequestReview = async () => {
    try {
        // 1. Get current count
        const countStr = await AsyncStorage.getItem(ACTION_COUNT_KEY);
        let count = countStr ? parseInt(countStr) : 0;

        // 2. Increment count
        count += 1;
        await AsyncStorage.setItem(ACTION_COUNT_KEY, count.toString());

        // 3. Check if milestone reached
        if (REVIEW_MILESTONES.includes(count)) {
            // 4. Check if StoreReview is available
            if (await StoreReview.hasAction()) {
                // 5. Request Review (Safe Mode: Catches errors silently)
                StoreReview.requestReview().catch(err => {
                    console.log("StoreReview Error (ignored for UX):", err);
                });
            }
        }
    } catch (error) {
        // Safe Mode: If anything fails (storage, logic), we silently ignore it.
        // The user's flow is never interrupted.
        console.log("ReviewHelper Error (ignored):", error);
    }
};
