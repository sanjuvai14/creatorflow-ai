import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.createsoul.app',
  appName: 'CreateSoul AI',
  webDir: 'out',
  server: {
    url: 'https://creatorflow-ai-sanjuvai14.vercel.app',
    cleartext: false
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
