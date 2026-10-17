const { sql, getPool } = require("../config/db.js");


async function getCart(req, res) {

    try {

        const pool = getPool();


        const result = await pool.request()

            .input(
                "user_id",
                sql.Int,
                req.user.user_id
            )

            .query(`

                SELECT
                    c.cart_id,
                    c.product_id,
                    c.cart_quantity,
                    c.cart_added_at,

                    p.product_name,
                    p.product_price,
                    p.product_image,

                    r.restraunt_name

                FROM cart c

                INNER JOIN products p
                    ON c.product_id = p.product_id

                LEFT JOIN restraunt r
                    ON p.restraunt_id = r.restraunt_id

                WHERE c.user_id = @user_id

                ORDER BY c.cart_added_at DESC

            `);


        let total = 0;

        for (const item of result.recordset) {

            item.item_total =
                Number(item.product_price) *
                item.cart_quantity;

            total += item.item_total;
        }


        res.json({
            success: true,
            items: result.recordset,
            total
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }
}



async function addToCart(req, res) {

    try {

        const {
            product_id,
            quantity
        } = req.body;


        const productId = Number(product_id);

        const qty = Number(quantity) || 1;


        if (qty <= 0) {

            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than zero"
            });
        }


        const pool = getPool();


        const existing = await pool.request()

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

            .query(`

                SELECT *
                FROM cart

                WHERE user_id = @user_id
                AND product_id = @product_id

            `);


        if (existing.recordset.length > 0) {

            await pool.request()

                .input(
                    "cart_id",
                    sql.Int,
                    existing.recordset[0].cart_id
                )

                .input(
                    "quantity",
                    sql.Int,
                    qty
                )

                .query(`

                    UPDATE cart

                    SET cart_quantity =
                        cart_quantity + @quantity

                    WHERE cart_id = @cart_id

                `);

        } else {

            await pool.request()

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
                    "quantity",
                    sql.Int,
                    qty
                )

                .query(`

                    INSERT INTO cart
                    (
                        user_id,
                        product_id,
                        cart_quantity
                    )

                    VALUES
                    (
                        @user_id,
                        @product_id,
                        @quantity
                    )

                `);
        }


        res.json({
            success: true,
            message: "Product added to cart"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not add product to cart"
        });
    }
}



async function updateCart(req, res) {

    try {

        const cartId = Number(req.params.id);

        const quantity = Number(req.body.quantity);


        if (quantity <= 0) {

            return removeFromCart(req, res);
        }


        const pool = getPool();


        const result = await pool.request()

            .input(
                "cart_id",
                sql.Int,
                cartId
            )

            .input(
                "user_id",
                sql.Int,
                req.user.user_id
            )

            .input(
                "quantity",
                sql.Int,
                quantity
            )

            .query(`

                UPDATE cart

                SET cart_quantity = @quantity

                WHERE cart_id = @cart_id
                AND user_id = @user_id

            `);


        if (result.rowsAffected[0] === 0) {

            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }


        res.json({
            success: true,
            message: "Cart updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update cart"
        });
    }
}



async function removeFromCart(req, res) {

    try {

        const cartId = Number(req.params.id);

        const pool = getPool();


        const result = await pool.request()

            .input(
                "cart_id",
                sql.Int,
                cartId
            )

            .input(
                "user_id",
                sql.Int,
                req.user.user_id
            )

            .query(`

                DELETE FROM cart

                WHERE cart_id = @cart_id
                AND user_id = @user_id

            `);


        if (result.rowsAffected[0] === 0) {

            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }


        res.json({
            success: true,
            message: "Item removed from cart"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not remove cart item"
        });
    }
}


module.exports = {
    getCart,
    addToCart,
    updateCart,
    removeFromCart
};