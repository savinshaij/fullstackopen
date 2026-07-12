const { describe, test } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://www.cleancoder.com/blog/2014/06/16/TypeWars.html',
    likes: 2,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Practical Aggregates',
    author: 'Robert C. Martin',
    url: 'http://www.cleancoder.com/blog/2015/11/18/Practical-Aggregates.html',
    likes: 0,
    __v: 0,
  },
]

describe('dummy', () => {
  test('returns one', () => {
    const result = listHelper.dummy([])

    assert.strictEqual(result, 1)
  })
})

describe('totalLikes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])

    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes([blogs[1]])

    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated correctly', () => {
    const result = listHelper.totalLikes(blogs)

    assert.strictEqual(result, 36)
  })
})

describe('favoriteBlog', () => {
  test('returns the blog with the most likes', () => {
    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, blogs[2])
  })

  test('returns null for an empty list', () => {
    const result = listHelper.favoriteBlog([])

    assert.strictEqual(result, null)
  })
})

describe('mostBlogs', () => {
  test('returns the author with the most blogs', () => {
    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3,
    })
  })

  test('returns null for an empty list', () => {
    const result = listHelper.mostBlogs([])

    assert.strictEqual(result, null)
  })
})

describe('mostLikes', () => {
  test('returns the author with the most likes', () => {
    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    })
  })

  test('returns null for an empty list', () => {
    const result = listHelper.mostLikes([])

    assert.strictEqual(result, null)
  })
})
