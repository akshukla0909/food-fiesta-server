const express = require('express');
const app = express()
const bodyParser = require('body-parser');

const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config()

const {connectDb} = require('./connection.js');
connectDb();

const routes = require('./routes.js');
const morgan = require('morgan');

app.use(cookieParser())
app.use(cors(
   { origin : ["http://localhost:5173", 'https://food-fiesta-alpha.vercel.app'], 
    credentials : true
}
))
app.use(bodyParser.json());
app.use(morgan('tiny'))

app.use('/', routes)


const PORT = 3000
app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}`);
})

