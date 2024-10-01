const {test, after, beforeEach} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const app = require('../app')
const blog = require('../models/blog')

const api  = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    console.log('cleared');
    // let blogObject = new Blog(helper.initialBlogs[0])
    // await blogObject.save()
    
    const blogObjects = helper.initialBlogs.map(blog=> new Blog(blog))
    const promiseArray = blogObjects.map(note => note.save())
    await Promise.all(promiseArray)
    console.log('done');
})

test('blogs are returned as json', async ()=> {
    await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('the blog list application returns the correct amount of blog posts', async ()=>{
    const response = await api.get('/api/blogs')
    // console.log(response.toJSON());
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('a valid note can be added', async () => {
    const newBlog = {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
      }
    await api.post('/api/blogs').send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(r => r.title)
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length+1)
    assert(titles.includes('Go To Statement Considered Harmful'))
})

after(async () => {
    await mongoose.connection.close()
    console.log('Database connection closed')
  })