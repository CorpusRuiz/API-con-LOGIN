const express = require('express')
const router = express.Router()
const axios = require('axios')
const {generateToken, verifyToken} = require('../middlewares/authMiddleware.js')
const users = require('../users/users.js')
const urlBase = `https://rickandmortyapi.com/api/character/`

router.get('/', (req, res) => {
    let loginform
    if(req.session.token) {
        loginform = `
        <a href="/search">Buscador de personaje</a>
        <a href="/characters">Lista completa de personajes</a>
        <form action="/logout" method="post">
            <button type="submit">Cerrar sesión</button>
        </form>        
        `
    } else {
        loginform = `
        <form action="/login" method="post">
          <label for="username">Usuario :</label>
          <input type="text" id="username" name="username" required><br>
    
          <label for="password">Contraseña :</label>
          <input type="password" id="password" name="password" required><br>
    
          <button type="submit">Iniciar sesión</button>
        </form>
        <a href="/characters">Lista de personajes</a>        
        `
    }
    res.send(loginform)
})

router.post('/login', (req, res) =>{
    const { username, password } = req.body;
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      const token = generateToken(user);
      req.session.token = token;
      res.redirect('/search');
    } else {
      res.status(401).json({ mensaje: 'Credenciales Incorrectas' });
    }
})

router.get('/characters', verifyToken, async (req, res) =>{
    try{
        const response = await axios.get(urlBase)
        const charactersInfo = response.data.results
        res.json({charactersInfo})
    } catch(err) {
        res.status(500).json({mensaje: 'El servidor se ha estropeado cocretamente 1!!!'})
    }
})


router.get('/search', verifyToken, (req, res) =>{
    res.send(`
    <h1>Buscador de personaje</h1>
    <form action="/findCharacter" method="post">
        <label for="characterName">Nombre del personaje a buscar :</label>
        <input type="text" id="characterName" name="characterName" required><br>
            <button type="submit">Buscar</button>
    </form>
    <a href="/characters">Lista completa de personajes</a>
    <a href="/">Return Home</a>
    `)
})

router.post('/findCharacter', verifyToken, (req, res) =>{
    const characterName = req.body
    console.log(characterName)
    const name = JSON.stringify(characterName.characterName)
    const finallyName = name.replace(/['"]+/g, '')
    res.redirect(`/character/${finallyName}`)

})

router.get('/character/:nombre', verifyToken, async (req, res) =>{
    const name = req.params.nombre
    console.log(name)
    const urlCharacter = `${urlBase}?name=${name}`

    try{
        const response = await axios.get(urlCharacter)
        const {name, status, species, gender, origin: {name: originName}, image} = response.data.results[0]

        res.send(`
        <figure>
            <img src="${image}" alt="${name}" />
            <figcaption>
            <h2>Name: ${name}</h2>
            <p>Status: ${status}</p>
            <p>Species: ${species}</p>
            <p>Gender: ${gender}</p>
            <p>Origin: ${originName}</p>
            </figcaption>
            </figure>
            <a href="/characters">Lista completa de personajes</a>
            <a href="/search">Buscador de personaje</a>
            <a href="/">Return Home</a>
        `)
    } catch (ERROR) {
        res.status(500).json({mensaje: 'El servidor se ha estropeado cocretamente!!!'})
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

module.exports = router