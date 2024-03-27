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
    const mostLikeSimple = { title, author, likes }
    return mostLikeSimple
}

  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}