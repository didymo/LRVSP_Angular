export const environment = {
  production: true,
  apiUrl: '',
  apiEndpoints: {
    allDocs: 'docs',
    linksForDoc: 'links',
    docDetails: 'details',
    fileUpload: 'file/upload',
    createDocfile: 'create'
  },
  requestScheduler: {
    maxActiveRequests: 10,
    minimumRequestTimeDelta: 1000
  },
  auth: {
    clientId: '',
    clientSecret: '',
    csrfTokenUrl: '',
    oauthTokenUrl: '',
  }
};
