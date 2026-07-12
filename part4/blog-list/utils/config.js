require('dotenv').config()

const PORT = process.env.PORT || 3003
const SECRET = process.env.SECRET || 'secret'
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1/bloglist_test'
  : process.env.MONGODB_URI || 'mongodb://127.0.0.1/bloglist'

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET,
}
