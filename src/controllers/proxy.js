import url from 'url';
import { green, red } from 'chalk';
import Redis from 'ioredis';
import axios from 'axios';

/**
 * Handles requests to be sent to an external source
 */
export default class ProxyController{

    constructor(config) {
        this.headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
        };

        this.subscriptionKey = config.subscriptionKey;
        this.baseUrl = config.BASE_URL;
        this.redis = new Redis();
    }
    
    /**
     * Get data from an external URL
     * Cache data in Redis and return stringified result of JSON
     *
     * @param {string} path
     * @return {string} 
     */
    getExternalData(path) {
        const targetURL = `${this.baseUrl}${path}`;
        console.log(green(`Proxy GET request to : ${targetURL}`));
        let response;

        return axios.get(
            targetURL, {
            headers: {
                'subscription-key': this.subscriptionKey,
            }})
            .then(({ data }) => {
                console.log(green('Hit From External'));
                response = data;
                return this.redis.set(path, JSON.stringify(response));
            })
            .then(() => response);
    }

    /**
     * Handles the incoming request and either returns data from cache
     * or calls out to the external URL for data
     *
     * @param {object} req 
     * @param {object} res 
     */
    proxyRequest(req, res) {
        const requestURL = url.parse(req.url);
        const { pathname } = requestURL;

        return this.redis.get(pathname)
            .then(result => {
                if (result) {
                    console.log(green('Hit from Redis'));
                    const parsed = JSON.parse(result);
                    parsed.fromCache = true;
                    return parsed;
                }
                return this.getExternalData(pathname);
            })
            .then(response => {
                res.writeHead(200, this.headers);
                res.end(JSON.stringify(response));
            })
            .catch(error => {
                console.log(red(error));
                res.writeHead(500, this.headers);
                res.end(JSON.stringify(error));
                throw error;
            })
    }
}

