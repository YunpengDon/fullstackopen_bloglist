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

test('a valid blog can be added', async () => {
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

test('blog without likes can be added', async () => {
    const newBlog = {
        title: 'Go To Statement Considered Harmful New',
        author: 'New author',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    }
    await api.post('/api/blogs').send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length+1)
})

test('note without title is not added', async () => {
    const newBlog = {
        author: 'New author',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    }

    await api.post('/api/blogs').send(newBlog)
        .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('note without url is not added', async () => {
    const newBlog = {
        title: 'Empty title',
        author: 'New author',
    }

    await api.post('/api/blogs').send(newBlog)
        .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('a blog can be deleted', async () => {
    const blogAtStart = await helper.blogsInDb()
    const blogToDelete = blogAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)
    const blogsAtEnd = await helper.blogsInDb()
    const ids = blogsAtEnd.map(r => r.id)
    assert(!ids.includes(blogToDelete.id))
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1 )
})

test('the information of an individual blog post can be updated', async () => {
    const blogAtStart = await helper.blogsInDb()
    const blogToUpdate = {...blogAtStart[1], likes: 100}
    
    await api.put(`/api/blogs/${blogToUpdate.id}`).send(blogToUpdate).expect(200)
    const blogsAtEnd = await api.get(`/api/blogs/${blogToUpdate.id}`)
    assert.strictEqual(blogsAtEnd.body.likes, 100)
})

after(async () => {
    await mongoose.connection.close()
    console.log('Database connection closed')
  })