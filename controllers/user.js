const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/users')
const { error } = require('../utils/logger')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)

})

usersRouter.post('/', async (request, response) => {
    const {username, name, password}  = request.body
    
    // Both username and password must be given and both must be at least 3 characters long. 
    if (username === undefined || password === undefined) {
        return response.status(400).json({error: 'Username and password should not be empty'})
    }
    if (password.length < 3){
        return response.status(400).json({error: 'Password must be at least 3 characters long'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter