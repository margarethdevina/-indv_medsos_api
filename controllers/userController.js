const { dbConf, dbQuery } = require('../config/database');
const { hashPassword, createToken } = require('../config/encryption');
const { uploader } = require('../config/uploader');
const fs = require('fs');
const { transporter } = require('../config/nodemailer');

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

                let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture }, "1h");

                // untuk coba simpan si token ❗❗❗
                // let tokenObj = { token };
                // let dataToken = JSON.stringify(tokenObj);
                // fs.writeFileSync('./public/tokenBlacklist/tokenList.json', dataToken, function (err) {
                //     if (err) {
                //         console.log('There has been an error saving your configuration data.');
                //         console.log(err.message);
                //         return;
                //     }
                //     console.log('Configuration saved successfully.')
                // });

                await transporter.sendMail({
                    from: "Leiden Admin",
                    to: email,
                    subject: "Verify Your Leiden Account",
                    html: `<div>
                        <h3>Hi ${username},</h3>
                        <h4>Thanks for joining Leiden. Please verify your account by clicking the link below</h4>
                        <h4><a href="${process.env.FE_URL}/verification/${token}">Verify your account</a></h4>
                        </div>`
                })

                return res.status(200).send({ ...getUsers[0], token, success: true });

            } else {
                return res.status(404).send({
                    success: false,
                    message: "User not found ⚠️"
                });
            }

        } catch (error) {
            console.log("error", error)
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
        if (req.dataUser.id) {
            console.log("req.dataUser", req.dataUser.id)
            const uploadFile = uploader('/imgProfile', `IMGPROFILE`).array('profilePicture', 1);

            uploadFile(req, res, async (error) => {

                try {
                    console.log("req.files", req.files);

                    // let profilePicture = req.files[0].filename;
                    let profileData = JSON.parse(req.body.data);
                    console.log("profileData", profileData);

                    let likes = [];

                    for (let propsBody in profileData) {
                        if (propsBody == "likes") {
                            likes = profileData[propsBody];
                        }
                    }

                    console.log("likes", likes);
                    if (likes.length == 0 && profileData.username) {

                        // 1️⃣query untuk update bagian profile saja

                        let getOldPassword = await dbQuery(`Select password FROM users where id = ${dbConf.escape(req.dataUser.id)};`);

                        console.log("getOldPassword", getOldPassword[0].password);

                        let profilePic = "";
                        if (req.files[0]) {
                            profilePic = req.files[0].filename;
                        }

                        let updatedId = "";
                        // profileData = JSON.parse(req.body.data);

                        console.log("JSON.parse(req.body.data)", JSON.parse(req.body.data));

                        let updateUserQuery = `UPDATE users SET `

                        if (profilePic) {
                            if (profileData.previousPassword == "") {

                                updatedId = `profilePicture = ${dbConf.escape(`/imgProfile/${profilePic}`)}, edit_date = current_timestamp() WHERE id = ${dbConf.escape(req.dataUser.id)};`

                            } else {

                                if (hashPassword(profileData.previousPassword) === getOldPassword[0].password && profileData.newPassword != "") {

                                    console.log("prev Pass", hashPassword(profileData.previousPassword));
                                    console.log("new Pass", profileData.newPassword);

                                    updatedId = `password = ${dbConf.escape(hashPassword(profileData.newPassword))}, profilePicture = ${dbConf.escape(`/imgProfile/${profilePic}`)}, edit_date = current_timestamp() WHERE id = ${dbConf.escape(req.dataUser.id)};`

                                } else {

                                    console.log("prev Pass password lama ga match atau pass baru = empty string", hashPassword(profileData.previousPassword));

                                    req.files.forEach(val => fs.unlinkSync(`./public/imgProfile/${val.filename}`));

                                    return next(error);

                                }
                            }
                        } else if (profileData.previousPassword) {

                            if (hashPassword(profileData.previousPassword) === getOldPassword[0].password && profileData.newPassword != "") {

                                console.log("prev Pass tanpa profile pic", hashPassword(profileData.previousPassword));
                                console.log("new Pass", profileData.newPassword);

                                updatedId = `password = ${dbConf.escape(hashPassword(profileData.newPassword))}, edit_date = current_timestamp() WHERE id = ${dbConf.escape(req.dataUser.id)};`
                            } else {

                                console.log("prev Pass tanpa profile pic, ga match dgn pass lama atau pass baru = empty string", hashPassword(profileData.previousPassword));

                                req.files.forEach(val => fs.unlinkSync(`./public/imgProfile/${val.filename}`));

                            }
                        } else {
                            updatedId = `edit_date = current_timestamp() WHERE id = ${dbConf.escape(req.dataUser.id)};`
                        }

                        for (let propsBody in profileData) {
                            if (propsBody != "previousPassword" && propsBody != "newPassword") {
                                console.log("profileData", profileData)

                                updateUserQuery += `${propsBody} = ${dbConf.escape(profileData[propsBody])}, `
                            }
                        }

                        // for testing purposes 💛
                        console.log("updateUserQuery", updateUserQuery);
                        console.log("updatedId", updatedId);

                        updateUserQuery += `${updatedId}`

                        let updateUser = await dbQuery(updateUserQuery);
                        // edit - checkpoint 1 1️⃣

                        // for testing purposes 💛
                        // console.log("final updateQuery", updateUserQuery)
                        // return res.status(200).send("success"); 

                        // return respon for edit user 🌮
                        let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where id = ${dbConf.escape(req.dataUser.id)};`);

                        let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                        let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture });

                        return res.status(200).send({ ...getUsers[0], token });

                    } else {
                        // 2️⃣query untuk update bagian likes unlikes saja
                        let getLikes = await dbQuery(`Select id, postId FROM likes where userId=${dbConf.escape(req.dataUser.id)};`);

                        let getLikesVal = []
                        for (let i = 0; i < getLikes.length; i++) {
                            getLikesVal.push(getLikes[i].postId);
                        }

                        console.log("getLikes", getLikes);
                        console.log("req.body.likes", likes);
                        console.log("getLikesVal", getLikesVal);

                        let updateLikesQuery = "";

                        // kalau post lama di unlike
                        if (getLikesVal.length > likes.length) {
                            console.log("getLikesVal.length > req.body.likes.length")

                            let deletedPostId = getLikesVal.filter((id1) => !likes.some((id2) => id2 === id1))[0];

                            let idTableLikes = getLikes.filter(val => val.postId === deletedPostId)[0].id;

                            console.log("idTableLikes", idTableLikes)
                            console.log("deletedPostId", deletedPostId);

                            // kalau post lama di unlike 🍙
                            updateLikesQuery = `Delete FROM likes where id = ${dbConf.escape(idTableLikes)};`

                            // kalau post baru di like
                        } else if (getLikesVal.length < likes.length) {
                            console.log("getLikesVal.length < req.body.likes.length")

                            let newPostId = likes.filter((id1) => !getLikesVal.some((id2) => id2 === id1))[0];

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
                } catch (error) {
                    req.files.forEach(val => fs.unlinkSync(`./public/imgProfile/${val.filename}`));
                    return next(error);
                }
            })
        }
    },
    deactivate: async (req, res, next) => {
        try {
            return res.status(200).send("<h1>deactivate ok</h1>");
        } catch (error) {
            return next(error);
        }
    },
    verification: async (req, res, next) => {
        try {
            if (req.dataUser) {

                let updateStatus = await dbQuery(`UPDATE users SET status = "verified" WHERE id = ${dbConf.escape(req.dataUser.id)};`);

                let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where id = ${dbConf.escape(req.dataUser.id)};`);

                let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture });

                return res.status(200).send({ ...getUsers[0], token, success: true });
            } else {
                return res.status(404).send({
                    success: false,
                    message: "User not found ⚠️"
                });
            }
        } catch (error) {
            console.log("error", error)
            return next(error);
        }
    },
    resendVerif: async (req, res, next) => {
        try {
            if (req.dataUser) {
                let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where id = ${dbConf.escape(req.dataUser.id)};`);

                let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

                let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture }, "1h");

                await transporter.sendMail({
                    from: "Leiden Admin",
                    to: email,
                    subject: "Resending Leiden Account Verification Link",
                    html: `<div>
                        <h3>Hi ${username},</h3>
                        <h4>Please verify your account by clicking the link below</h4>
                        <h4><a href="${process.env.FE_URL}/verification/${token}">Verify your account</a></h4>
                        </div>`
                })

                return res.status(200).send({ ...getUsers[0], token, success: true });
            } else {
                return res.status(404).send({
                    success: false,
                    message: "User not found ⚠️"
                });
            }
        } catch (error) {
            console.log("error", error)
            return next(error);
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            console.log("req.body.email", req.body.email)

            let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where email = ${dbConf.escape(req.body.email)};`);

            let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

            let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture }, "1h");

            await transporter.sendMail({
                from: "Leiden Admin",
                to: email,
                subject: "Reset Your Leiden Account Password Request",
                html: `<div>
                        <h3>Hi ${username},</h3>
                        <h4>Please insert your new password by clicking the link below</h4>
                        <h4><a href="${process.env.FE_URL}/newpassword/${token}">Insert new password</a></h4>
                        </div>`
            })
            // <a href="${process.env.FE_URL}/newpassword/${token}">Click here to reset your password</a>
            // <button type="button" onclick="${process.env.FE_URL}/newpassword/${token}">Insert new password</button>

            return res.status(200).send({ ...getUsers[0], token, success: true });

        } catch (error) {
            return next(error);
        }
    },
    resetPassword: async (req, res, next) => {
        try {
            console.log("req.dataUser.id", req.dataUser.id)

            let insertNewPassword = await dbQuery(`UPDATE users SET password = ${dbConf.escape(hashPassword(req.body.password))}, edit_date = current_timestamp() WHERE id = ${dbConf.escape(req.dataUser.id)};`);

            let getUsers = await dbQuery(`Select id, username, email, status, role, fullname, bio, profilePicture FROM users where id = ${dbConf.escape(req.dataUser.id)};`);

            let { id, username, email, status, role, fullname, bio, profilePicture } = getUsers[0];

            let token = createToken({ id, username, email, status, role, fullname, bio, profilePicture });

            return res.status(200).send({ ...getUsers[0], token, success: true });

        } catch (error) {
            return next(error);
        }
    }
}