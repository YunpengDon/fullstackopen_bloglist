const blogRouter = require('express').Router()
const User = require('../models/users')
// const { request, response } = require('../app')
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')

// const getTokenFrom = request => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.startsWith('Bearer ')) {
//     return authorization.replace('Bearer ', '')
//   }
//   return null
// }

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', 'username name id')
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id).populate('user', 'username name id')
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.post('/', async(request, response) => {
  const {userId, ...blogInfo} = request.body
  // const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id){
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    ...blogInfo,
    likes: blogInfo.likes || 0,
    user: userId
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})


blogRouter.delete("/:id", async (request, response, next) => {
  // If deleting a blog is attempted without a token or by an invalid user, the operation should return a suitable status code.
  if (!request.token){
    return response.status(401).json({ error: 'token invalid' })
  }

  //  a blog can be deleted only by the user who added it
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() !== decodedToken.id.toString()) {
    return response.status(401).json({ error: 'blog can be deleted only by the user who added it.' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.put("/:id", async (request, response, next) => {
  const blog = request.body

  saveBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
  response.status(200).json(saveBlog)
})

module.exports = blogRouter