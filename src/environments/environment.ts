export const environment = {
  production: true,
  apiUrl: '',
  apiEndpoints: {
    allDocs: 'docs',
    linksForDoc: 'links',
    docDetails: 'details'
  },
  requestScheduler: {
    maxActiveRequests: 10,
    minimumRequestTimeDelta: 1000
  }
};
