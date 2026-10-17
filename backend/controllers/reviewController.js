const { sql, getPool } = require("../config/db.js");


async function addReview(req, res) {

    try {

        const productId = Number(req.params.productId);

        const {
            review,
            review_rating
        } = req.body;


        if (
            !review ||
            !review_rating ||
            review_rating < 1 ||
            review_rating > 5
        ) {

            return res.status(400).json({
                success: false,
                message: "Review and rating between 1 and 5 are required"
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
                "product_id",
                sql.Int,
                productId
            )

            .input(
                "review",
                sql.VarChar,
                review
            )

            .input(
                "review_rating",
                sql.Int,
                review_rating
            )

            .query(`

                INSERT INTO reviews
                (
                    user_id,
                    product_id,
                    review,
                    review_rating
                )

                OUTPUT INSERTED.*

                VALUES
                (
                    @user_id,
                    @product_id,
                    @review,
                    @review_rating
                )

            `);


        res.status(201).json({
            success: true,
            message: "Review added",
            review: result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        if (error.number === 2601 || error.number === 2627) {

            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }


        res.status(500).json({
            success: false,
            message: "Could not add review"
        });
    }
}



async function getProductReviews(req, res) {

    try {

        const productId = Number(req.params.productId);

        const pool = getPool();


        const result = await pool.request()

            .input(
                "product_id",
                sql.Int,
                productId
            )

            .query(`

                SELECT
                    rv.review_id,
                    rv.review,
                    rv.review_rating,
                    rv.reviewed_at,
                    u.username

                FROM reviews rv

                INNER JOIN users u
                    ON rv.user_id = u.user_id

                WHERE rv.product_id = @product_id

                ORDER BY rv.reviewed_at DESC

            `);


        res.json({
            success: true,
            reviews: result.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not fetch reviews"
        });
    }
}


module.exports = {
    addReview,
    getProductReviews
};