const _ = require('lodash')
const dummy = (blogs) => {
    return 1
}
const totalLikes = (blogs) => {
    // empty list returns 0
    if (blogs.length == 0){
        return 0
    }
    // returns the sum of likes in the blog array
    const addReducer = (sum, blog) => {
        return sum + blog.likes
    }
    return blogs.reduce(addReducer, 0)
}

const favoriteBlog = (blogs) => {
    // empty list returns null
    if (blogs.length == 0){
        return blogs
    }
    // returns the blog that has the most likes
    //if thera are multiple blogs with most likes, only return one of them.
    let mostLike = 0
    let mostLikeList = []
    for (const blog of blogs) {
        if (blog.likes > mostLike) {
            mostLike = blog.likes
            mostLikeList = [blog]
        }
        if (blog.likes === mostLike) {
            mostLikeList.push(blog)
        }
    }
    const { title, author, likes } = mostLikeList[0]
    const mostLikeBlog = { title, author, likes }
    return mostLikeBlog
}

const mostBlogs = (blogs) => {
    // empty list returns null
    if (blogs.length == 0){
        return blogs
    }
    
    // count the blogs by each author
    authorList = _.countBy(blogs, 'author')
    
    // returns the author who has the largest amount of blogs.
    let mostBlogNumber = 0
    let mostBlogAuthor = null
    for (const key in authorList) {
        if (authorList[key] > mostBlogNumber) {
            mostBlogNumber = authorList[key]
            mostBlogAuthor = key
        }
    }
    return {
        author: mostBlogAuthor,
        blogs: mostBlogNumber
    }
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}