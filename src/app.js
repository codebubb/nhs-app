/* istanbul ignore file */
import { createServer } from 'http';
import { green } from 'chalk';
import ProxyController from './controllers/proxy';
import config from '../config';

const proxyController = new ProxyController(config);
const server = createServer(proxyController.proxyRequest.bind(proxyController));

server.listen(3000, () => {
    console.log(green('Server listening'));
  } );