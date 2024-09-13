// const express = require('express');
import express from 'express'
const app = express();

// const dotenv = require('dotenv')
import dotenv, { populate } from 'dotenv'
dotenv.config()

// require("dotenv").config()

import morgan from 'morgan'
import connectDB from './db/connection.js'


const port = process.env.PORT || 8000;


//import route
import categoryRoute from './routes/categoryRoute.js'
import productRoute from './routes/productRoute.js'
import cors from 'cors'
import path from 'path'
import userRoute from './routes/userRoute.js'
import orderRoute from './routes/orderRoute.js'
import processRoute from './routes/paymentRoute.js'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded( ))
app.use(cors())
app.use('/public', express.static(path.join(__dirname, '/src/uploads/images')))

//use route
app.use('/api/v1', categoryRoute)
app.use('/api/v1', productRoute)
app.use('/api/v1', userRoute)
app.use('/api/v1', orderRoute)
app.use('/api/v1', processRoute)

//localhost:2000/api/v1/add-category


connectDB()
.then(
app.listen(port, ()=>{
    console.log(`server running on port: ${port}.`)    
}))
.catch(error => console.log('Unable to Connect', error))
