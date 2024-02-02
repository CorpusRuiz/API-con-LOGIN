const express = require('express')
const app = express()
const session = require('express-session')
const hashedSecret = require('./crypto/config.js')
const router = require('./routes/routes.js')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: hashedSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false}
    })
)

app.use('/', router)


app.listen(3000, () => {
    console.log('Express esta escuchando en el puesto http://localhost:3000')
})