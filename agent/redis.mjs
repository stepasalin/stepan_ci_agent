import Redis from 'ioredis';
import JSONCache from 'redis-json';

const redis = new Redis();
const jsonCache = new JSONCache(redis)



const user = {
  name: "test",
  age: 21,
  gender: "male"
}
await jsonCache.set('123', user)

const result = await jsonCache.get('123')

console.log(result); 