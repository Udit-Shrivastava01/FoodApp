const { sql, getPool } = require("../config/db.js");


async function getPaymentByOrder(req, res) {

    try {

        const orderId = Number(req.params.orderId);

        const pool = getPool();


        const result = await pool.request()

            .input(
                "order_id",
                sql.Int,
                orderId
            )

            .input(
                "user_id",
                sql.Int,
                req.user.user_id
            )

            .query(`

                SELECT
                    p.payment_id,
                    p.order_id,
                    p.payment_method,
                    p.payment_amount,
                    p.payment_status,
                    p.payement_at

                FROM payment p

                INNER JOIN orders o
                    ON p.order_id = o.order_id

                WHERE p.order_id = @order_id
                AND o.user_id = @user_id

            `);


        res.json({
            success: true,
            payment: result.recordset[0] || null
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not fetch payment"
        });
    }
}


module.exports = {
    getPaymentByOrder
};