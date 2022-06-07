const { dbConf, dbQuery } = require('../config/database');

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
            return res.status(200).send("<h1>register ok</h1>");
        } catch (error) {
            return next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            console.log("isi query", req.body);
            let { password, email, username } = req.body;
            let queryUsers = ""
            if (password) {
                if (email) {
                    queryUsers = `Select id, username, password, email, status, role, fullname, bio, profilePicture FROM users where email = ${dbConf.escape(email)} and password = ${dbConf.escape(password)};`
                } else if (username) {
                    queryUsers = `Select id, username, password, email, status, role, fullname, bio, profilePicture FROM users where username = ${dbConf.escape(username)} and password = ${dbConf.escape(password)};`
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
                return res.status(200).send(getUsers);
            }

        } catch (error) {
            return next(error);
        }
    },
    keepLogin: async (req, res, next) => {
        try {
            console.log("isi query", req.body);
            if (req.body.id) {
                let getUsers = await dbQuery(`Select id, username, password, email, status, role, fullname, bio, profilePicture FROM users where id = ${dbConf.escape(req.body.id)};`);

                let getLikes = await dbQuery(`Select userId, postId FROM likes where userId=${dbConf.escape(req.body.id)};`);

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
                    message: "User not found"
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