export const environment = {
  production: true,
  apiUrl: 'https://relationshipb.corporatememory.com.au',
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
    clientId: 'Qn_US_R84REVfN8hOkFDggqdeph--IzuTCkUjRNxdvA',
    clientSecret: '75EA9774A15F233A3431AA8C1D7D7',
    csrfTokenUrl: 'https://relationshipb.corporatememory.com.au/session/token',
    oauthTokenUrl: 'https://relationshipb.corporatememory.com.au/oauth/token',
  }
};
