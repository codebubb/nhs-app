import { createServer } from 'http';
import { green } from 'chalk';
import ProxyModel from './controllers/proxy';

const proxyModel = new ProxyModel();
const server = createServer((req, res) => proxyModel.proxyRequest(req, res));

server.listen(3000, () => {
    console.log(green('Server listening'));
  } );