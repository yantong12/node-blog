const querystring = require('querystring')

const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

const {set, get} = require('./src/db/redis')
const { access } = require('./src/utils/log')

// 获取cookie的过期时间
const getCookieExpires = () => {
  const d = new Date()
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
  console.log('d.toGMTString()', d.toGMTString())
  return d.toGMTString()
}

// //session数据
// const SESSION_DATA = {}

// 用于处理postData
const getPostData = (req) => {
  const promise = new Promise((resolve, reject) => {
    if(req.method !== 'POST') {
      resolve({})
      return
    }
    if(req.headers['content-type'] !== 'application/json') {
      resolve({})
      return
    }

    let postData = ''
    req.on('data', chunk=> {
      postData += chunk.toString()
    })

    req.on('end', ()=> {
      if (!postData) {
        resolve({})
        return
      }
      resolve(JSON.parse(postData))
    })
  })
  return promise
}



const serverHandle = (req, res) => {

  // 记录access log

  access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)
  // 设置返回格式JSON
  res.setHeader('Content-type', 'application/json')

  // 获取path
  const url = req.url
  req.path = url.split('?')[0]

  // 解析query
  req.query = querystring.parse(url.split('?')[1])

  // 解析cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || '' // k1=v1;k2=v2;k3=v3;
  cookieStr.split(';').forEach(item => {
    if (!item) {
      return
    }
    const arr = item.split('=')
    const key = arr[0].trim()
    const val = arr[1].trim()
    req.cookie[key] = val
  })
  console.log('req.cookie', req.cookie)

  // // 解析session
  // let needSetCookie = false
  // let userId = req.cookie.userid
  // if (userId) {
  //   if (!SESSION_DATA[userId]) {
  //     SESSION_DATA[userId] = {}
  //   }
  // } else {
  //   needSetCookie = true
  //   userId = `${Date.now()}_${Math.random}`
  //   SESSION_DATA[userId] = {}
  // }
  // req.session = SESSION_DATA[userId]

  // 解析session
  let needSetCookie = false
  let userId = req.cookie.userid
  if (!userId) {
    needSetCookie = true
    userId = `${Date.now()}_${Math.random()}`
    set(userId, {})
  }

  // 获取session
  req.sessionId = userId
  get(req.sessionId).then(sessionData => {
    if (sessionData == null) {
      set(req.sessionId, {})
      req.session = {}
    } else {
      req.session = sessionData
    }

    console.log('req.session', req.session)

    // 处理postData
    return getPostData(req)
  })
// 处理postData
 .then(postData => {
    req.body = postData

    // 处理blog路由
    const blogResult = handleBlogRouter(req, res) 
    if (blogResult) {
      blogResult.then((blogData) => {
        if (needSetCookie) {
          // 操作cookie
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; exprires = ${getCookieExpires()}`)
        }
        res.end(
          JSON.stringify(blogData)
        )
      })
      return
    }

      // 处理user路由
      const userResult = handleUserRouter(req, res) 
      if (userResult) {
        userResult.then(userData => {
          if (needSetCookie) {
            // 操作cookie
            res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; exprires = ${getCookieExpires()}`)
          }
          res.end(
            JSON.stringify(userData)
          )
        })
        return
      }
      // if (userData) {
      //   res.end(
      //     JSON.stringify(userData)
      //   )
      //   return
      // }

      // 未命中路由
      res.writeHead(404, {'Content-type': "text/palin"})
      res.write('404 Not Found\n')
      res.end()
  })


  
}

module.exports = serverHandle


// process.env.NODE_ENV