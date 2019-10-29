/* eslint-env node, mocha */

import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import ProxyController from '../src/controllers/proxy';
import Redis from 'ioredis';

describe('Proxy Controller:', function() {
    let proxyController;
    const sandbox = sinon.sandbox.create();
    const configStub = {
        BASE_URL: 'http://localhost',
    };

    beforeEach(() => {
        proxyController = new ProxyController(configStub);
    });
    afterEach(() => {
        proxyController.redis.quit();
        sandbox.restore();
    });


    it('constructs the proxy object successfully', () => {
        expect(proxyController.headers).to.be.an('object');
        expect(proxyController.headers['Access-Control-Allow-Methods']).to.be.eql('GET');
        expect(proxyController.baseUrl).to.be.eql(configStub.BASE_URL);
        expect(proxyController.redis).to.be.instanceOf(Redis);
    });

    it('gets external data from url', (done) => {
        const pathRequested = '/random/path/req';
        nock('http://localhost')
            .get(pathRequested)
            .reply(200, { status: 'OK'});

        proxyController.getExternalData(pathRequested)
            .then(response => {
                expect(response).to.be.an('object');
                expect(response).to.have.property('status');
                expect(response.status).to.be.eql('OK');
                done();
            })
            .catch(done);
    });

    describe('proxy request method', () => {
        const reqStub = { 
            url: 'http://localhost/random/path/req',
        };

        const resStub = {
            writeHead: () => {},
            end: () => {}
        };

        it('retrieves data from redis if the content is already cached', (done) => {
            sandbox.stub(Redis.prototype, 'get')
                .resolves(JSON.stringify( { data: 'found' }));

            proxyController.proxyRequest(reqStub, resStub)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('retrieves data from external source is not found in cache', (done) => {
            sandbox.stub(Redis.prototype, 'get')
                .resolves(null);
            sandbox.stub(proxyController, 'getExternalData')
                .resolves({ data: 'found'} );

            proxyController.proxyRequest(reqStub, resStub)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('catches errors that occur from redis lookups', (done) => {
            sandbox.stub(Redis.prototype, 'get')
                .rejects({ message: 'Redis offline'});
            
            proxyController.proxyRequest(reqStub, resStub)
                .then(error => {
                    expect(error).to.be.eql('test failed');
                    done();
                })
                .catch(error => {
                    expect(error.message).to.be.eql('Redis offline');
                    done();
                })
                .catch(done);
        });

        it('catches errors that occur from external lookups', (done) => {
            sandbox.stub(Redis.prototype, 'get')
                .resolves(null);
            sandbox.stub(proxyController, 'getExternalData')
                .rejects({ message: 'External offline'});
            
            proxyController.proxyRequest(reqStub, resStub)
                .then(error => {
                    expect(error).to.be.eql('test failed');
                    done();
                })
                .catch(error => {
                    expect(error.message).to.be.eql('External offline');
                    done();
                })
                .catch(done);
        });
    });

});