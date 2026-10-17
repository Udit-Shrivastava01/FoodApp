const { sql, getPool } = require("../config/db.js");


async function createFeedback(req, res) {

    try {

        const {
            feedback,
            feedback_rate
        } = req.body;


        if (
            !feedback_rate ||
            feedback_rate < 1 ||
            feedback_rate > 5
        ) {

            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }


        const pool = getPool();


        const result = await pool.request()

            .input(
                "user_id",
                sql.Int,
                req.user.user_id
            )

            .input(
                "feedback",
                sql.VarChar,
                feedback || null
            )

            .input(
                "feedback_rate",
                sql.Int,
                feedback_rate
            )

            .query(`

                INSERT INTO feedback
                (
                    user_id,
                    feedback,
                    feedback_rate
                )

                OUTPUT INSERTED.*

                VALUES
                (
                    @user_id,
                    @feedback,
                    @feedback_rate
                )

            `);


        res.status(201).json({
            success: true,
            message: "Feedback submitted",
            feedback: result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not submit feedback"
        });
    }
}



async function getFeedback(req, res) {

    try {

        const pool = getPool();


        const result = await pool.request().query(`

            SELECT
                f.feedback_id,
                f.feedback,
                f.feedback_rate,
                u.username

            FROM feedback f

            INNER JOIN users u
                ON f.user_id = u.user_id

            ORDER BY f.feedback_id DESC

        `);


        res.json({
            success: true,
            feedback: result.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not fetch feedback"
        });
    }
}


module.exports = {
    createFeedback,
    getFeedback
};