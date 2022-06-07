const { dbConf, dbQuery } = require('../config/database');
const { hashPassword, createToken } = require('../config/encryption');

module.exports = {
    getData: async (req, res, next) => {
        try {
            let getUsers = await dbQuery(`Select id, username, password, email, status, role, fullname, bio, profilePicture FROM users;`);

            let getLikes = await dbQuery(`Select userId, postId FROM likes;`);

            getUsers.forEach(val => {
                val.likes = [];
                getLikes.forEach(valdbLike => {
                    if (val.id == valdbLike.userId) {
                        val.likes.push(valdbLike.postId)
                    }
                })
            })

            return res.status(200).send(getUsers);
        } catch (error) {
            return next(error);
        }
    },
    register: async (req, res, next) => {
        try {
            console.log("req.body", req.body);

            let { email, username, password, status, role, fullname, bio, profilePicture } = req.body;

            let insertData = await dbQuery(`INSERT INTO users (email, username, password, status, role, fullname, bio, profilePicture) VALUES (${dbConf.escape(email)},${dbConf.escape(username)},${dbConf.escape(hashPassword(password))},${dbConf.escape(status)},${dbConf.escape(role)},${dbConf.escape(fullname)},${dbConf.escape(bio)},${dbConf.escape(profilePicture)});`);

            if (insertData.insertId) {
                let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where id = ${insertData.insertId};`);
                if (getUsers.length == 1) {
                    let getLikes = await dbQuery(`Select userId, postId FROM likes;`);

                    getUsers.forEach(val => {
                        val.likes = [];
                        getLikes.forEach(valdbLike => {
                            if (val.id == valdbLike.userId) {
                                val.likes.push(valdbLike.postId)
                            }
                        })
                    })
                    return res.status(200).send(getUsers[0]);
                } else {
                    return res.status(404).send({
                        success: false,
                        message: "User not found ⚠️"
                    });
                }
            }
        } catch (error) {
            return next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            console.log("isi query", req.body);
            // let { password, email, username } = req.body;
            let queryUsers = ""
            if (req.body.password) {
                if (req.body.email) {
                    queryUsers = `Select id, username, email, status, role, fullname, bio, profilePicture FROM users where email = ${dbConf.escape(req.body.email)} and password = ${dbConf.escape(hashPassword(req.body.password))};`
                } else if (req.body.username) {
                    queryUsers = `Select id, username, email, status, role, fullname, bio, profilePicture FROM users where username = ${dbConf.escape(req.body.username)} and password = ${dbConf.escape(hashPassword(req.body.password))};`
                }
                let getUsers = await dbQuery(queryUsers);

                let getLikes = await dbQuery(`Select userId, postId FROM likes;`);

                getUsers.forEach(val => {
                    val.likes = [];
                    getLikes.forEach(valdbLike => {
                        if (val.id == valdbLike.userId) {
                            val.likes.push(valdbLike.postId)
                        }
                    })
                })

                let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture });

                return res.status(200).send({ ...getUsers[0], token });
            } else {
                return res.status(404).send({
                    success: false,
                    message: "user not found"
                });
            }

        } catch (error) {
            return next(error);
        }
    },
    keepLogin: async (req, res, next) => {
        try {
            console.log("isi query", req.dataUser);
            if (req.dataUser.id) {
                let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where id = ${dbConf.escape(req.dataUser.id)};`);

                if (getUsers.length == 1) {

                    let getLikes = await dbQuery(`Select userId, postId FROM likes where userId=${dbConf.escape(req.body.id)};`);

                    getUsers.forEach(val => {
                        val.likes = [];
                        getLikes.forEach(valdbLike => {
                            if (val.id == valdbLike.userId) {
                                val.likes.push(valdbLike.postId)
                            }
                        })
                    })

                    let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                    let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture });

                    return res.status(200).send({ ...getUsers[0], token });
                }

            } else {
                return res.status(404).send({
                    success: false,
                    message: "Token expired"
                })
            }
        } catch (error) {
            return next(error);
        }
    },
    edit: async (req, res, next) => {
        try {

            return res.status(200).send("<h1>edit ok</h1>");
        } catch (error) {
            return next(error);
        }
    }
}