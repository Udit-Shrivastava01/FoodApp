const { sql, getPool } = require("../config/db.js");

async function createOrder(req, res) {
    const pool = getPool();
    const transaction = new sql.Transaction(pool);

    try {
        const { restaurant_id, payment_method } = req.body;

        await transaction.begin();

        const request = new sql.Request(transaction);

        const cartResult = await request
            .input("user_id", sql.Int, req.user.user_id)
            .query(`
                SELECT
                    c.product_id,
                    c.cart_quantity,
                    p.product_price
                FROM cart c
                INNER JOIN products p
                    ON c.product_id = p.product_id
                WHERE c.user_id = @user_id
            `);

        if (cartResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        let totalAmount = 0;

        for (const item of cartResult.recordset) {
            totalAmount += Number(item.product_price) * item.cart_quantity;
        }

        const orderRequest = new sql.Request(transaction);

        const orderResult = await orderRequest
            .input("user_id", sql.Int, req.user.user_id)
            .input("restaurant_id", sql.Int, restaurant_id)
            .input("total_amount", sql.Decimal(10, 2), totalAmount)
            .query(`
                INSERT INTO orders
                (
                    user_id,
                    restaurant_id,
                    total_amount,
                    order_status
                )
                OUTPUT INSERTED.order_id
                VALUES
                (
                    @user_id,
                    @restaurant_id,
                    @total_amount,
                    'pending'
                )
            `);

        const orderId = orderResult.recordset[0].order_id;

        for (const item of cartResult.recordset) {
            const itemRequest = new sql.Request(transaction);

            await itemRequest
                .input("order_id", sql.Int, orderId)
                .input("product_id", sql.Int, item.product_id)
                .input("quantity", sql.Int, item.cart_quantity)
                .input("price_at_order", sql.Decimal(10, 2), item.product_price)
                .query(`
                    INSERT INTO order_items
                    (
                        order_id,
                        product_id,
                        quantity,
                        price_at_order
                    )
                    VALUES
                    (
                        @order_id,
                        @product_id,
                        @quantity,
                        @price_at_order
                    )
                `);
        }

        await new sql.Request(transaction)
            .input("user_id", sql.Int, req.user.user_id)
            .query(`
                DELETE FROM cart
                WHERE user_id = @user_id
            `);

        if (payment_method) {
            await new sql.Request(transaction)
                .input("order_id", sql.Int, orderId)
                .input("payment_method", sql.VarChar, payment_method)
                .input("payment_amount", sql.Decimal(10, 2), totalAmount)
                .query(`
                    INSERT INTO payment
                    (
                        order_id,
                        payment_method,
                        payment_amount,
                        payment_status
                    )
                    VALUES
                    (
                        @order_id,
                        @payment_method,
                        @payment_amount,
                        'successful'
                    )
                `);
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order_id: orderId,
            total_amount: totalAmount
        });

    } catch (error) {
        try {
            await transaction.rollback();
        } catch (_) {}

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Order creation failed"
        });
    }
}

async function getMyOrders(req, res) {
    try {
        const pool = getPool();

        const result = await pool.request()
            .input("user_id", sql.Int, req.user.user_id)
            .query(`
                SELECT
                    o.order_id,
                    o.total_amount,
                    o.order_status,
                    o.order_date,
                    r.restraunt_name
                FROM orders o
                LEFT JOIN restraunt r
                    ON o.restaurant_id = r.restraunt_id
                WHERE o.user_id = @user_id
                ORDER BY o.order_date DESC
            `);

        res.json({
            success: true,
            orders: result.recordset
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not fetch orders"
        });
    }
}

async function getOrderById(req, res) {
    try {
        const orderId = Number(req.params.id);

        const pool = getPool();

        const orderResult = await pool.request()
            .input("order_id", sql.Int, orderId)
            .input("user_id", sql.Int, req.user.user_id)
            .query(`
                SELECT *
                FROM orders
                WHERE order_id = @order_id
                AND user_id = @user_id
            `);

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const itemsResult = await pool.request()
            .input("order_id", sql.Int, orderId)
            .query(`
                SELECT
                    oi.*,
                    p.product_name,
                    p.product_image
                FROM order_items oi
                INNER JOIN products p
                    ON oi.product_id = p.product_id
                WHERE oi.order_id = @order_id
            `);

        res.json({
            success: true,
            order: orderResult.recordset[0],
            items: itemsResult.recordset
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not fetch order"
        });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "cooking",
            "ready",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const pool = getPool();

        const result = await pool.request()
            .input("order_id", sql.Int, orderId)
            .input("status", sql.VarChar, status)
            .query(`
                UPDATE orders
                SET order_status = @status
                WHERE order_id = @order_id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message: "Order status updated"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update order"
        });
    }
}

// =====================================================
// GET ALL ORDERS - ADMIN
// =====================================================

const getAllOrders = async (req, res) => {
    try {
        // FIXED: Added missing pool initialization
        const pool = getPool();

        const result = await pool.request().query(`
            SELECT
                o.order_id,
                o.user_id,
                o.restaurant_id,
                o.order_status,
                o.total_amount,
                o.order_date,
                u.username,
                u.email,
                r.restraunt_name
            FROM orders o
            LEFT JOIN users u
                ON o.user_id = u.user_id
            LEFT JOIN restraunt r
                ON o.restaurant_id = r.restraunt_id
            ORDER BY
                o.order_date DESC
        `);

        res.status(200).json({
            success: true,
            orders: result.recordset
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch orders.",
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders
};