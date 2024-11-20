export const environment = {
  production: false,
  apiUrl: 'https://lrvspb.didymodesigns.com.au',
  apiEndpoints: {
    allDocs: 'docs',
    linksForDoc: 'links',
    docDetails: 'details',
    fileUpload: 'file/upload',
    createDocfile: 'create'
  },
  requestScheduler: {
    maxActiveRequests: 10,
    minimumRequestTimeDelta: 120
  },
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    csrfTokenUrl: 'https://lrvspb.didymodesigns.com.au/session/token',
    oauthTokenUrl: 'https://lrvspb.didymodesigns.com.au/oauth/token',
  }
};
