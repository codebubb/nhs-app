import { expect } from 'chai';
import sinon from 'sinon';
import ProxyController from '../src/controllers/proxy';

describe('Simple test suite:', function() {
    let proxyController;
    beforeEach(() => {
        proxyController = new ProxyController();
    });
    afterEach(() => {
        proxyController.redis.quit();
    });
   it('tests proxy', () => {
        expect(proxyController.headers).to.be.instanceOf(Object);
   });
});