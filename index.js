const express = require('express');
const app = express();
const cors = require('cors');
const bearerToken = require('express-bearer-token');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;

app.use(bearerToken());
app.use(express.json());
app.use(cors());
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
    res.status(500).send(error);
})

app.listen(PORT, () => console.log(`Running API at PORT ${PORT}`))