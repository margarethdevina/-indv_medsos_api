const { dbConf, dbQuery } = require('../config/database');
const { uploader } = require('../config/uploader');
const fs = require('fs');

module.exports = {
    getData: async (req, res, next) => {
        try {
            let getData = await dbQuery(`Select p.id, u.username, p.media, p.caption, p.uploadDate, p.editedDate, count(l.postId) as numberOfLikes from posts p left join users u on p.userId = u.id left join likes l on p.id = l.postId where p.status = "active" group by p.id;`)

            return res.status(200).send(getData);
        } catch (error) {
            return next(error);
        }
    },
    add: async (req, res, next) => {
        if (req.dataUser.id) {
            const uploadFile = uploader('/imgPost', `IMGPOST`).array('media', 1);

            uploadFile(req, res, async (error) => {
                try {
                    console.log("req.body", req.body);
                    console.log("req.files", req.files);

                    let media = req.files[0].filename;
                    let { caption } = JSON.parse(req.body.data);

                    let insertPost = await dbQuery(`INSERT INTO posts (userId, media, caption) VALUES (${dbConf.escape(req.dataUser.id)}, ${dbConf.escape(`/imgPost/${media}`)}, ${dbConf.escape(caption)});`);

                    if (insertPost.insertId) {
                        let getData = await dbQuery(`Select p.id, u.username, p.media, p.caption, p.uploadDate, p.editedDate, count(l.postId) as numberOfLikes from posts p 
                        left join users u on p.userId = u.id 
                        left join likes l on p.id = l.postId where p.id = ${dbConf.escape(insertPost.insertId)} group by p.id;`);

                        console.log("getData setelah insert", getData)
                        return res.status(200).send(getData[0]);
                    }
                } catch (error) {
                    req.files.forEach(val => fs.unlinkSync(`./public/imgPost/${val.filename}`));
                    return next(error);
                }
            })
        } else {
            return res.status(401).send('You not authorize for this feature');
        }
    },
    detail: async (req, res, next) => {
        try {
            // console.log("req.query",req.query);
            let getData = await dbQuery(`Select p.id, u.username, p.media, p.caption, p.uploadDate, p.editedDate, count(l.postId) as numberOfLikes from posts p 
            left join users u on p.userId = u.id 
            left join likes l on p.id = l.postId where p.id = ${dbConf.escape(req.query.id)} group by p.id;`);

            console.log("getData di post detail", getData)
            return res.status(200).send(getData[0]);

        } catch (error) {
            return next(error);
        }
    },
    edit: async (req, res, next) => {
        try {

            if (req.dataUser.id) {
                // console.log("req.params.id, req.body", req.params.id, req.body);
                let updatePost = await dbQuery(`UPDATE posts SET caption = ${dbConf.escape(req.body.caption)}, editedDate = current_timestamp() WHERE id = ${dbConf.escape(req.params.id)};`);

                return res.status(200).send({
                    success: true,
                    message: "Edit post success"
                });
            }

        } catch (error) {
            return next(error);
        }
    },
    delete: async (req, res, next) => {
        try {

            if (req.dataUser.id) {

                // console.log("req.params.id", req.params.id);
                let deletePost = await dbQuery(`UPDATE posts SET status = "inactive", editedDate = current_timestamp() WHERE id = ${dbConf.escape(req.params.id)};`);

                let getLikes = await dbQuery(`SELECT * FROM likes where postId = ${dbConf.escape(req.params.id)};`);

                if (getLikes.length > 0) {
                    let deleteLikesQuery = `UPDATE likes SET status = "inactive" where id in (`
                    let likesIdQuery = ``
                    for (let i = 0; i < getLikes.length - 1; i++) {
                        likesIdQuery += `${getLikes[i].id}, `
                    }

                    deleteLikesQuery += `${likesIdQuery}${getLikes[getLikes.length - 1].id});`

                    let deleteLikes = await dbQuery(deleteLikesQuery);
                }

                let getComments = await dbQuery(`SELECT * FROM comments where postId = ${dbConf.escape(req.params.id)};`);

                if (getComments.length > 0) {
                    let deleteCommentsQuery = `UPDATE comments SET status = "inactive" where id in (`
                    let commentsIdQuery = ``
                    for (let i = 0; i < getComments.length - 1; i++) {
                        commentsIdQuery += `${getComments[i].id}, `
                    }

                    deleteCommentsQuery += `${commentsIdQuery}${getComments[getComments.length - 1].id});`

                    let deleteComments = await dbQuery(deleteCommentsQuery);
                }

                return res.status(200).send({
                    success: true,
                    message: "Delete post success"
                });

            }

        } catch (error) {
            return next(error);
        }
    },
    paginate: async (req, res, next) => {
        try {
            console.log("req.query._page", req.query._page);

            let getData = await dbQuery(`Select p.id, u.username, p.media, p.caption, p.uploadDate, p.editedDate, count(l.postId) as numberOfLikes from posts p left join users u on p.userId = u.id left join likes l on p.id = l.postId where p.status = "active" group by p.id LIMIT 4 OFFSET ${dbConf.escape((req.query._page - 1) * 4)};`);

            return res.status(200).send(getData);

        } catch (error) {
            return next(error);
        }
    }
}