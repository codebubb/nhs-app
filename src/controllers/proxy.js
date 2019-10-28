import url from 'url';
import { green, red } from 'chalk';
import Redis from 'ioredis';
import axios from 'axios';
import config from '../config';

export default class ProxyModel {
    constructor() {
        this.headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
        };
        this.redis = new Redis();
    }
    
    getExternalData(path) {
        const targetURL = `${config.BASE_URL}${path}`;
        console.log(green(`Proxy GET request to : ${targetURL}`));
        let response;

        return axios.get(targetURL)
            .then(({ data }) => {
                console.log(green('Hit From External'));
                response = data;
                return this.redis.set(path, JSON.stringify(response));
            })
            .then(() => JSON.stringify(response));
    };

    proxyRequest(req, res) {
        const requestURL = url.parse(req.url);
        const { pathname } = requestURL;
        let response;

        // Check in REDIS.
        console.log(this.redis);

        this.redis.get(pathname)
            .then(result => {
                if (result) {
                    console.log(green('Hit from Redis'));
                    return result;
                }
                return this.getExternalData(pathname);
            })
            .then((response) => {
                res.writeHead(200, this.headers);
                res.end(response);
            })
            .catch(response => {
                console.log(red(response));
                res.writeHead(500, this.headers);
                res.end(JSON.stringify(response));
            })
            .catch(console.log);
    };
}

