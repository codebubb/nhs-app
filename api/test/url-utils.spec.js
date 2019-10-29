/* eslint-env node, mocha */

import { expect } from 'chai';
import { decodeParams } from '../src/utils/url-utils';
import url from 'url';

describe('url utils functions', () => {
    describe('decode url params', () => {
        it('decodes url params into an object successfully', () => {
            const urlWithParams = 'http://localhost/?name=james&job=developer';
            const parsedUrl = url.parse(urlWithParams);
            const decoded = decodeParams(new URLSearchParams(parsedUrl.query));
            expect(decoded).to.be.an('object');
            expect(decoded.name).to.be.eql('james');
        });
    });
});