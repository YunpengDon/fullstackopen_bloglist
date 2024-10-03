const blogRouter = require('express').Router()
const User = require('../models/users')
// const { request, response } = require('../app')
const Blog = require('../models/blog')

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
  const user = await User.findById(userId)

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
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.put("/:id", async (request, response, next) => {
  const blog = request.body

  saveBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
  response.status(200).json(saveBlog)
})

module.exports = blogRouter