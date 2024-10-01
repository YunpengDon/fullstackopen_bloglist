const blogRouter = require('express').Router()
// const { request, response } = require('../app')
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
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

module.exports = blogRouter