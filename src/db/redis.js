const redis = require('redis')
const { REDIS_CONF } = require('../config/db')

redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host);


redisClient.on('error', err => {
  console.log(err)
})


function set (key, val) {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  redisClient.set(key, val)
}

function get (key) {
  const promise = new Promise((resolve, reject) => {
    redisClient.get(key, (err,val) => {
      if (err) {
        reject(err)
        return
      }
      if (val == null) {
        resolve(null)
        return
      }

    // 如果是json返回个对象，如果正常，正常返回
    try {
        resolve(JSON.parse(val))
      } catch (ex) {
        resolve(val)
      }
    })
  })

  return promise
}

module.exports = {
  set,
  get
}