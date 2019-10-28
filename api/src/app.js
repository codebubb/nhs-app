import { createServer } from 'http';
import { green } from 'chalk';
import ProxyController from './controllers/proxy';

const proxyController = new ProxyController();
const server = createServer(proxyController.proxyRequest.bind(proxyController));

server.listen(3000, () => {
    console.log(green('Server listening'));
  } );