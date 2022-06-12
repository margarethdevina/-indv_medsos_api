const { dbConf, dbQuery } = require('../config/database');

module.exports = {
    getData: async (req, res, next) => {
        try {
            let getData = await dbQuery(`select c.postId, c.id, u.username, c.commentDate, c.editedDate, c.comment from comments c left join users u on c.userId = u.id where c.status = "active";`);

            return res.status(200).send(getData);
        } catch (error) {
            return next(error);
        }
    },
    paginate: async (req, res, next) => {
        try {
            // console.log("req.query.postId, req.query._page", req.query.postId, req.query._page);
            
            let getData = await dbQuery(`select c.postId, c.id, u.username, c.commentDate, c.editedDate, c.comment from comments c left join users u on c.userId = u.id where c.status = "active" and c.postId = ${dbConf.escape(req.query.postId)} ORDER BY commentDate DESC LIMIT 5 OFFSET ${dbConf.escape((req.query._page-1)*5)};`);

            return res.status(200).send(getData)

        } catch (error) {
            return next(error);
        }
    },
    add: async (req, res, next) => {
        try {
            console.log("req.body", req.body);
            if (req.dataUser.id) {
                let insertComment = await dbQuery(`INSERT INTO comments (postId, userId, comment) VALUES (${dbConf.escape(req.body.postId)}, ${dbConf.escape(req.dataUser.id)}, ${dbConf.escape(req.body.comment)});`);

                if (insertComment.insertId) {
                    let getData = await dbQuery(`select c.postId, c.id, u.username, c.commentDate, c.editedDate, c.comment from comments c left join users u on c.userId = u.id where c.status = "active" and c.id = ${dbConf.escape(insertComment.insertId)};`);

                    return res.status(200).send(getData[0]);
                }
            }

        } catch (error) {
            return next(error);
        }
    },
    edit: async (req, res, next) => {
        try {

            if (req.dataUser.id) {
                // console.log("req.params.id, req.body",req.params.id, req.body);
                let updateComment = await dbQuery(`UPDATE comments SET comment = ${dbConf.escape(req.body.comment)}, editedDate = current_timestamp() WHERE id = ${dbConf.escape(req.params.id)};`);

                return res.status(200).send({
                    success: true,
                    message: "Edit comment success"
                });
            }
        } catch (error) {
            return next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            if (req.dataUser.id) {
                // console.log("req.params.id",req.params.id);
                let deleteComment = await dbQuery(`UPDATE comments SET status = "inactive" where id = ${dbConf.escape(req.params.id)};`);

                return res.status(200).send({
                    success: true,
                    message: "Delete comment success"
                });
            }
        } catch (error) {
            return next(error);
        }
    }
}