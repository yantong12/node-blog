const xss = require('xss')
const { exec } = require('../db/mysql')

// xxx.html?a=100&k1=v1&k2=v2

const getList = (author, keyword) => {
  let sql = `select * from blogs where 1=1 `

  if (author) {
    sql += `and author='${author}' `
  }

  if (keyword) {
    sql += `and title like '%${keyword}%' `
  }

  sql += `order by createtime desc;`

  return exec(sql)
}

const getDetail = (id) => {
  let sql = `select * from blogs where id=${id}`
  return exec(sql).then(rows => {
    return rows[0]
  })
}

const getNewBlog = (blogData = {}) => {
  const title = xss(blogData.title)
  const content = xss(blogData.content)
  const author = blogData.author
  const createtime = Date.now()
  let sql = `insert into blogs (title,content,author,createtime) values ('${title}','${content}','${author}',${createtime})`

  return exec(sql).then(data => {
    console.log(data)
    return data.insertId
  })
}

const updateBlog = (id, blogData = {}) => {
  const title = xss(blogData.title)
  const content = xss(blogData.content)
  const author = blogData.author
  const sql = `update blogs set title='${title}',content='${content}',author='${author}' where id=${id} `
  return exec(sql).then((rows) => {
    if (rows.affectedRows > 0) {
      return true
    }
    return false
  })
}
const delBlog = (id, author) => {
  const sql = `delete from blogs where id=${id} and author='${author}'`
  return exec(sql).then((rows) => {
    console.log(rows)
    if (rows.affectedRows > 0) {
      return true
    }
    return false
  })
}


module.exports = {
  getList,
  getDetail,
  getNewBlog,
  updateBlog,
  delBlog
}