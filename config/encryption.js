const jwt = require('jsonwebtoken');
const Crypto = require('crypto');

module.exports = {
    hashPassword: (pass) => {
        return Crypto.createHmac("sha256", process.env.SECRET_CRYPTO).update(pass).digest("hex");
    },
    createToken: (payload) => {
        let token = jwt.sign(payload, process.env.SECRET_TOKEN, {
            expiresIn: "7d"
        })
        return token;
    },
    readToken: (req, res, next) => {
        jwt.verify(req.token, process.env.SECRET_TOKEN, (err, decode) => {
            if (err) {
                res.status(401).send({
                    message: "user is not authenticated ❌"
                })
            }
            req.dataUser = decode;
            next();
        })
    }
}