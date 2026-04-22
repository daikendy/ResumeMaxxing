import { CapacitorConfig } from '@capacitor/cli';

// This checks if you are running a production build
const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.resumemaxxing.app',
  appName: 'Resumemaxxing',
  webDir: 'out',
  server: {
    // Only allow cleartext in development
    androidScheme: isProduction ? 'https' : 'http',
    cleartext: !isProduction
  }
};

export default config;
