const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Jacob',
            email: 'jacob@example.com',
            password: 'Bamba22!'
        })
        .expect(201)
    
    // Assert the the DB was changed currectly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Jacob',
            email: 'jacob@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('Bamba22!') // the password should be hashed

})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login noneexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'aaaaa@example.com',
            password: '123456789'
        })
        .expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avater image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update user valid fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Nestea The Dog',
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Nestea The Dog')
})

test('Should not update user invalid fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'ashkelon',
        })
        .expect(400)
})

// my tests:

test('Should not signup user with invalid name', async () => {
    await request(app)
        .post('/users')
        .send({
            name: {},
        })
        .expect(400)
})
test('Should not signup user with invalid email', async () => {
    await request(app)
        .post('/users')
        .send({
            email: "thisisnotanemail",
        })
        .expect(400)
})
test('Should not signup user with invalid password', async () => {
    await request(app)
        .post('/users')
        .send({
            password: "123",
        })
        .expect(400)
})

test('Should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Nestea The Dog',
        })
        .expect(401)
})

test('Should not update user with invalid name', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: {},
        })
        .expect(400)
})

test('Should not update user with invalid email', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'NotAnEmail',
        })
        .expect(400)
})
test('Should not update user with invalid password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'password',
        })
        .expect(400)
})

test('Should not delete user if unauthenticated', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})