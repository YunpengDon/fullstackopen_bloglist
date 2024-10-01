const blogRouter = require('express').Router()
const blog = require('../models/blog')
// const { request, response } = require('../app')
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.post('/', async(request, response) => {
  const body = request.body

  const blog = new Blog({
    ...body,
    likes: body.likes || 0,
  })

  const saveBlog = await blog.save()
  response.status(201).json(saveBlog)
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