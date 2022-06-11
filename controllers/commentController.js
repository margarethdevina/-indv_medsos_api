const { dbConf, dbQuery } = require('../config/database');

module.exports = {
    getData: async (req, res, next) => {
        try {
            let getData = await dbQuery(`select c.postId, c.id, u.username, c.commentDate, c.editedDate, c.comment from comments c left join users u on c.userId = u.id;`);

            return res.status(200).send(getData);
        } catch (error) {
            return next(error);
        }
    },
    paginate: async (req, res, next) => {
        try {

        } catch (error) {
            return next(error);
        }
    },
    add: async (req, res, next) => {
        try {
            console.log("req.body", req.body);

            
        } catch (error) {
            return next(error);
        }
    },
    edit: async (req, res, next) => {
        try {
            // console.log("req.params.id, req.body",req.params.id, req.body);
            let updateComment = await dbQuery(`UPDATE comments SET comment = ${dbConf.escape(req.body.comment)}, editedDate = current_timestamp() WHERE id = ${dbConf.escape(req.params.id)};`);

            return res.status(200).send({
                success: true,
                message: "Edit comment success"
            });
        } catch (error) {
            return next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            // console.log("req.params.id",req.params.id);
            let deleteComment = await dbQuery(`Delete from comments where id = ${dbConf.escape(req.params.id)};`);
            
            return res.status(200).send({
                success: true,
                message: "Delete comment success"
            });
        } catch (error) {
            return next(error);
        }
    }
}