export const environment = {
  env: 'PROD',
  version: '1.22.1',
  apiBase: 'http://api.mawgifservices.com:8003/api',
  baseAssetsUrl: 'http://api.mawgifservices.com:8003/api/',
  production: true,
  mqttServer: {
    hostname: 'maps.mawgifservices.com',
    port: 1884,
    path: '',
  },
  sites: {
    // maps: 'http://maps.mawgifservices.com:4203/map',
    operation: 'http://operation.mawgifservices.com:4205',
  },
};
