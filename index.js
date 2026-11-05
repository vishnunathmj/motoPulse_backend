require('dotenv').config()
const cors = require('cors')
const express = require('express')
require('./config/db')
const server = express()

server.use(cors())
server.use(express.json())


// port
const PORT = process.env.PORT

// start server
server.listen(PORT,()=>{
    console.log("server started");
})

// browser display
server.get('/',(req,res)=>{
    res.status(200).send('<h1>server started</h1>')
})

const routes = require('./routing/router')
server.use(routes)