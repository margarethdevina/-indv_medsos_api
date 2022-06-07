const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;

app.use(express.json());

app.use(cors());

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
const { userRouter } = require('./routers');
app.use('/users', userRouter);

// Handling error 🍖
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).send(error);
})

app.listen(PORT, () => console.log(`Running API at PORT ${PORT}`))