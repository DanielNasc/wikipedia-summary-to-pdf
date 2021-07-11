const express = require('express')
const cookie_parser = require('cookie-parser')

const app = express()
const path = require('path')
const resultController = require('./controllers/resultController')

const PORT = process.env.PORT || 3000
const htmlPath = path.join(__dirname,'../views/index.html')

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(cookie_parser())

app.get('/', (req,res) => res.sendFile(htmlPath))
app.post('/', resultController.save)
app.get('/result/:path', resultController.render)
app.get('/ops', resultController.erro)
app.use((req,res) => {
    req.setTimeout
    res.status(404).send('<h1>404</h1>')})

const server = app.listen(PORT)
server.setTimeout(500000)