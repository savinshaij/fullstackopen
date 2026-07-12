process.env.NODE_ENV = 'test'

const { beforeEach, after, describe, test } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const config = require('../utils/config')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
    likes: 10,
  },
]

let token
let currentUserId

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = await new User({
    username: 'root',
    name: 'Super User',
    passwordHash,
  }).save()

  token = jwt.sign(
    { username: user.username, id: user._id },
    config.SECRET
  )
  currentUserId = user._id.toString()

  const blogsToInsert = initialBlogs.map(blog => ({
    ...blog,
    user: user._id,
  }))

  const insertedBlogs = await Blog.insertMany(blogsToInsert)
  user.blogs = insertedBlogs.map(blog => blog._id)
  await user.save()
})

describe('users api', () => {
  test('users are returned as json from /api/users', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].blogs.length, initialBlogs.length)
  })

  test('a valid user can be added', async () => {
    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: 'secret123',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, 2)
  })

  test('creating a user with a short username fails', async () => {
    const newUser = {
      username: 'ab',
      name: 'Short Username',
      password: 'secret123',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(response.body.error, /username must be at least 3 characters long/)
  })

  test('creating a user with a short password fails', async () => {
    const newUser = {
      username: 'validuser',
      name: 'Short Password',
      password: 'ab',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(response.body.error, /password must be at least 3 characters long/)
  })

  test('creating a user with an existing username fails', async () => {
    const newUser = {
      username: 'root',
      name: 'Duplicate',
      password: 'secret123',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(response.body.error, /username must be unique/)
  })

  test('login returns a token with valid credentials', async () => {
    const credentials = {
      username: 'root',
      password: 'sekret',
    }

    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body.token)
  })
})

describe('blog api', () => {
  test('blogs are returned as json from /api/blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialBlogs.length)
    assert.strictEqual(typeof response.body[0].user, 'object')
    assert.ok(response.body[0].user.username)
  })

  test('blog objects have id property instead of _id', async () => {
    const response = await api.get('/api/blogs').expect(200)

    response.body.forEach((blog) => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  test('a valid blog can be added with a token', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)
    assert.strictEqual(blogsAtEnd.some(blog => blog.title === newBlog.title), true)
    assert.strictEqual(
      blogsAtEnd.find(blog => blog.title === newBlog.title).user.toString(),
      currentUserId
    )
  })

  test('adding a blog without a token fails with 401', async () => {
    const newBlog = {
      title: 'No token blog',
      author: 'Someone',
      url: 'https://example.com/no-token',
      likes: 1,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })

  test('likes defaults to 0 when missing', async () => {
    const newBlog = {
      title: 'No likes yet',
      author: 'Someone',
      url: 'https://example.com/no-likes-yet',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)
  })

  test('missing title returns 400', async () => {
    const newBlog = {
      author: 'Someone',
      url: 'https://example.com/no-title',
      likes: 1,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('missing url returns 400', async () => {
    const newBlog = {
      title: 'No url',
      author: 'Someone',
      likes: 1,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('a blog can be deleted by its creator', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})

    assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)
    assert.strictEqual(blogsAtEnd.some(blog => blog.id === blogToDelete.id), false)
  })

  test('a blog cannot be deleted by another user', async () => {
    const passwordHash = await bcrypt.hash('sekret2', 10)
    const anotherUser = await new User({
      username: 'other',
      name: 'Other User',
      passwordHash,
    }).save()

    const otherToken = jwt.sign(
      { username: anotherUser.username, id: anotherUser._id },
      config.SECRET
    )

    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403)
  })

  test('a blog can be updated', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 1,
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)

    const updatedBlog = await Blog.findById(blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})
