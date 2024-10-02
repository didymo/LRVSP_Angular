export const environment = {
  production: false,
  apiUrl: 'http://api.documap.local',
  apiEndpoints: {
    allDocs: 'docs',
    linksForDoc: 'links',
    docDetails: 'details'
  },
  requestScheduler: {
    maxActiveRequests: 10,
    minimumRequestTimeDelta: 120
  },
  auth: {
    clientId: '',
    clientSecret: '',
    csrfTokenUrl: 'http://api.documap.local/session/token',
    oauthTokenUrl: 'http://api.documap.local/oauth/token',
  }
};
