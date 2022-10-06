const redis = require('redis')

const redisClient = redis.createClient({
    // Redis url dari docker container
    url: 'redis://localhost:3001'
})

module.exports = redisClient