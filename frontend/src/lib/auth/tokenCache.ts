import { Preferences } from '@capacitor/preferences';

/**
 * Native Token Cache for Clerk (Capacitor)
 * This ensures that the JWT is stored in the native device storage
 * rather than relying on Cookies, which are unstable in Capacitor.
 */
export const tokenCache = {
  async getToken(key: string) {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error("TOKEN_CACHE_GET_FAILURE", error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await Preferences.set({
        key,
        value,
      });
    } catch (error) {
      console.error("TOKEN_CACHE_SAVE_FAILURE", error);
    }
  },
};
