import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const version = Platform.Version;

    if (version < 29) {
      const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      return result === RESULTS.GRANTED;
    }
  }
  return true; // Permissions not required for Android 13+
};
