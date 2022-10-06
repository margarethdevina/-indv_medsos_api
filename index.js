const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = {
    origin: 'https://leiden-api.herokuapp.com',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));
const bearerToken = require('express-bearer-token');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(bearerToken());
app.use(express.json());
app.use(express.static('public'));

//DB check connection 🍣
const { dbConf } = require('./config/database');
dbConf.getConnection((error, connection) => {
    if (error) {
        console.log("Error MySQL connection ❌", error.message, error.sqlMessage);
    }
    console.log(`Connected to MySQL Server ✅: ${connection.threadId}`)
})

app.get('/', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
    res.status(200).send("<h1>Medsos Individual Project API</h1>")
})

// Handling router 🍛
const { userRouter, postRouter, commentRouter } = require('./routers');
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);

// Handling error 🍖
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).send({ message: error, success: false });
})

app.listen(PORT, () => console.log(`Running API at PORT ${PORT}`))