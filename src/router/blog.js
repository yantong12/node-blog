const { getList,
  getDetail,
  getNewBlog,
  updateBlog,
  delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel} = require('../model/resModel')

// 统一的登录验证函数

const loginCheck = (req) => {
  if (!req.session.username) {
        return  Promise.resolve(new ErrorModel('尚未登录')) 
      }
}


const handleBlogRouter = (req, res) => {
  const method = req.method
  const id = req.query.id

  // 获取博客列表
  if (method === 'GET' && req.path === '/api/blog/list') {

    let author = req.query.author || ''
    const keyword = req.query.keyword || ''

    if(req.query.isadmin) {
      // 管理员界面
      const loginCheckResult = loginCheck(req)

      if (loginCheckResult) {
        // 未登录
        return loginCheckResult
      }

      author = req.session.username
    }


    const result = getList(author, keyword)

    return result.then(listData => {
      return new SuccessModel(listData)
    })
  }

  // 获取博客详情
  if (method === 'GET' && req.path === '/api/blog/detail') {
    const result = getDetail(id)
    return result.then(data => {
      return new SuccessModel(data)
    })
  }

  // 新建博客
  if (method === "POST" && req.path === '/api/blog/new') {

    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }
    const author = req.session.username
    req.body.author = author
    const result = getNewBlog(req.body)
    return result.then((data) => {
      return new SuccessModel(data)
    })
  }

  // 更新博客
  if (method === "POST" && req.path === '/api/blog/update') {

    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }

    const author = req.session.username
    req.body.author = author

    const result = updateBlog(id, req.body)
    return result.then(data => {
      if (data) {
        return new SuccessModel()
      }
      return new ErrorModel('更新博客失败')
    })
  }

  // 删除博客
  if (method === "POST" &&req.path === '/api/blog/delete') {

    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }

    const author = req.session.username
    const result = delBlog(id, author)
    return result.then(data => {
      if (data) {
        return new SuccessModel()
      }
      return new ErrorModel('删除博客失败')
    })
  }
}

module.exports = handleBlogRouter