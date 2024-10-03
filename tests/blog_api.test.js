const {test, after, beforeEach, before, describe} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/users')

const app = require('../app')

const api  = supertest(app)

let authHeader

before(async () => {
    const response = await api.post('/api/login').send(helper.initialUser)
    const token = response.body.token
    authHeader = `Bearer ${token}`
})

describe('Tests on Blog operations', ()=>{
beforeEach(async () => {
    await Blog.deleteMany({})
    console.log('cleared');

    const blogs = helper.initialBlogs.map(blog => ({...blog, user: helper.initialUser.id}))
    const blogObjects = blogs.map(blog=> new Blog(blog))
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
    await api.post('/api/blogs').set('Authorization', authHeader).send(newBlog)
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
    await api.post('/api/blogs').set('Authorization', authHeader).send(newBlog)
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

    await api.post('/api/blogs').set('Authorization', authHeader).send(newBlog)
        .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('note without url is not added', async () => {
    const newBlog = {
        title: 'Empty title',
        author: 'New author',
    }

    await api.post('/api/blogs').set('Authorization', authHeader).send(newBlog)
        .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('a blog can be deleted', async () => {
    const blogAtStart = await helper.blogsInDb()
    const blogToDelete = blogAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', authHeader).expect(204)
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
})

describe('Invalied user can not be created', () => {
    test('username must be given', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            name: 'Matti Luukkainen',
            password: 'salainen',
        }
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Username and password should not be empty'))
    
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('password must be given', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'root',
            name: 'Matti Luukkainen',
        }
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Username and password should not be empty'))
    
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('password must be at least 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'sa',
        }
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Password must be at least 3 characters long'))
    
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
    console.log('Database connection closed')
  })