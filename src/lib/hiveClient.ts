import { Client } from '@hiveio/dhive';

const nodes = [
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network'
];

const client = new Client(nodes, { 
  timeout: 8000, 
  failoverThreshold: 3,
  addressPrefix: 'STM',
  chainId: 'beeab0de00000000000000000000000000000000000000000000000000000000'
});

export default client;