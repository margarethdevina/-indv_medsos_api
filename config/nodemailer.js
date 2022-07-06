const nodemailer = require('nodemailer');
const path = require('path')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS_EMAIL
    }
    , tls: { rejectUnauthorized: false }
})

const handlebarOptions = {
    viewEngine:
    // 'express-handlebars'
    {
        // extName: ".handlebars.html",
        partialsDir: path.resolve(__dirname,'views'),
        // partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    }
    ,
    viewPath: 
    // './views/'
    // path.resolve('./views/'),
    path.resolve(__dirname,'views'),
    // extName:".handlebars.html"
};

module.exports = { transporter, handlebarOptions };