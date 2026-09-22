const config = {
  appId: 'ai.createsoul.app',
  appName: 'CreateSoul AI',
  webDir: 'out',
  server: {
    url: 'https://creatorflow-ai-sanjuvai14.vercel.app',
    cleartext: false,
    allowNavigation: [
      'creatorflow-ai-sanjuvai14.vercel.app',
      'creatorflow-ai-psi.vercel.app',
      'creatorflow-ai-git-main-sanjuvai14.vercel.app'
    ]
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
