const {test, after, beforeEach} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const app = require('../app')

const api  = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    console.log('cleared');
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    console.log('done');
})

test('blogs are returned as json', async ()=> {
    await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('the blog list application returns the correct amount of blog posts', async ()=>{
    const response = await api.get('/api/blogs')
    console.log(response.toJSON());
    assert.strictEqual(response.body.length, 1)
})

after(async () => {
    await mongoose.connection.close()
    console.log('Database connection closed')
  })