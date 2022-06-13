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

                    let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                    let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture });

                    return res.status(200).send({ ...getUsers[0], token });
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
            console.log("isi req.body", req.body);
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

                console.log("getUsers", getUsers);

                let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture });

                return res.status(200).send({ ...getUsers[0], token });
            } else {
                return res.status(404).send({
                    success: false,
                    message: "User not found ⚠️"
                });
            }

        } catch (error) {
            return next(error);
        }
    },
    keepLogin: async (req, res, next) => {
        try {
            // console.log("isi query", req.dataUser);
            if (req.dataUser.id) {
                let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where id = ${dbConf.escape(req.dataUser.id)};`);

                if (getUsers.length == 1) {

                    let getLikes = await dbQuery(`Select userId, postId FROM likes where userId=${dbConf.escape(req.dataUser.id)};`);

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
            console.log("req.dataUser, req.body", req.dataUser.id, req.body)

            if (req.dataUser.id) {
                if (!req.body.likes) {
                    let updateUserQuery = `UPDATE users SET `
                    let updatedId = `edit_date = current_timestamp() WHERE id = ${dbConf.escape(req.dataUser.id)};`

                    for (let propsBody in req.body) {
                        updateUserQuery += `${propsBody} = ${dbConf.escape(req.body[propsBody])}, `
                    }

                    updateUserQuery += `${updatedId}`

                    let updateUser = await dbQuery(updateUserQuery);
                    // edit - checkpoint 1 1️⃣
                    console.log("final updateQuery", updateUserQuery)

                    // return respon for edit user 🌮
                    let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where id = ${dbConf.escape(req.dataUser.id)};`);

                    let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                    let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture });

                    return res.status(200).send({ ...getUsers[0], token });

                } else {
                    let getLikes = await dbQuery(`Select id, postId FROM likes where userId=${dbConf.escape(req.dataUser.id)};`);

                    let getLikesVal = []
                    for (let i = 0; i < getLikes.length; i++) {
                        getLikesVal.push(getLikes[i].postId);
                    }

                    console.log("getLikes", getLikes);
                    console.log("req.body.likes", req.body.likes);
                    console.log("getLikesVal", getLikesVal);

                    let updateLikesQuery = "";

                    // kalau post lama di unlike
                    if (getLikesVal.length > req.body.likes.length) {
                        console.log("getLikesVal.length > req.body.likes.length")

                        let deletedPostId = getLikesVal.filter((id1) => !req.body.likes.some((id2) => id2 === id1))[0];

                        let idTableLikes = getLikes.filter(val => val.postId === deletedPostId)[0].id;

                        console.log("idTableLikes", idTableLikes)
                        console.log("deletedPostId", deletedPostId);

                        // kalau post lama di unlike 🍙
                        updateLikesQuery = `Delete FROM likes where id = ${dbConf.escape(idTableLikes)};`

                        // kalau post baru di like
                    } else if (getLikesVal.length < req.body.likes.length) {
                        console.log("getLikesVal.length < req.body.likes.length")

                        let newPostId = req.body.likes.filter((id1) => !getLikesVal.some((id2) => id2 === id1))[0];

                        console.log("newPostId", newPostId);

                        // kalau post baru di like 🍟
                        updateLikesQuery = `INSERT INTO likes (userId, postId) VALUES (${dbConf.escape(req.dataUser.id)},${dbConf.escape(newPostId)});`

                    }

                    let updateLikes = await dbQuery(updateLikesQuery);
                    // edit - checkpoint 2 2️⃣
                    // harapan delete likes  => userId = 17
                    // harapan add likes => userId = 17 postId = 12
                    console.log("updateLikesQuery", updateLikesQuery);

                    // return response for edit Likes 🧀
                    let getUpdatedLikes = await dbQuery(`Select postId FROM likes where userId=${dbConf.escape(req.dataUser.id)};`);

                    let getUpdatedLikesVal = []
                    for (let i = 0; i < getUpdatedLikes.length; i++) {
                        getUpdatedLikesVal.push(getUpdatedLikes[i].postId);
                    }

                    return res.status(200).send(getUpdatedLikesVal)
                }

            }
        } catch (error) {
            return next(error);
        }
    },
    deactivate: async (req, res, next) => {
        try {
            return res.status(200).send("<h1>deactivate ok</h1>");
        } catch (error) {
            return next(error);
        }
    },
    forgetPassword: async (req, res, next) => {
        try {
            // if (req.dataUser.id) {
            // console.log("req.dataUser.id, req.body.password",req.dataUser.id, req.body.password)
            let getUsers = await dbQuery(`Select id, username, password, email, status, role, fullname, bio, profilePicture FROM users;`);

            let idUser = getUsers.filter(val => val.email === req.body.email)[0].id;

            let insertNewPassword = await dbQuery(`UPDATE users SET password = ${dbConf.escape(hashPassword(req.body.password))}, edit_date = current_timestamp() WHERE id = ${dbConf.escape(idUser)};`);

            return res.status(200).send({
                success: true,
                message: "Password changed"
            })

            // } else {
            //     console.log("error",error);
            //     return res.status(404).send({
            //         success: false,
            //         message: "Token expired"
            //     })
            // }

        } catch (error) {
            return next(error);
        }
    }
}