import { promisify } from 'util';
import * as Redis from 'ioredis';


export default class RedisModel {
    constructor() {
        this.client = new Redis();
    }
}

