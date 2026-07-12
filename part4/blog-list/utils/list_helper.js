const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((favorite, blog) => (blog.likes > favorite.likes ? blog : favorite))
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const counts = {}

  blogs.forEach((blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })

  let topAuthor = ''
  let topCount = 0

  Object.entries(counts).forEach(([author, count]) => {
    if (count > topCount) {
      topAuthor = author
      topCount = count
    }
  })

  return {
    author: topAuthor,
    blogs: topCount,
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likesByAuthor = {}

  blogs.forEach((blog) => {
    likesByAuthor[blog.author] = (likesByAuthor[blog.author] || 0) + blog.likes
  })

  let topAuthor = ''
  let topLikes = 0

  Object.entries(likesByAuthor).forEach(([author, likes]) => {
    if (likes > topLikes) {
      topAuthor = author
      topLikes = likes
    }
  })

  return {
    author: topAuthor,
    likes: topLikes,
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
