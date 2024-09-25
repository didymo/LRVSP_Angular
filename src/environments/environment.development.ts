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
  }
};
