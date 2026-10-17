const { sql, getPool } = require("../config/db.js");

// GET /api/products - Get all products
async function getProducts(req, res) {
    try {
        const pool = getPool();

        const result = await pool.request().query(`
            SELECT 
                p.*,
                r.restraunt_name
            FROM products p
            LEFT JOIN restraunt r
                ON p.restraunt_id = r.restraunt_id
            ORDER BY p.product_id DESC
        `);

        res.json({
            success: true,
            products: result.recordset
        });

    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
}

// GET /api/products/:id - Get a single product by ID
async function getProductById(req, res) {
    try {
        const productId = Number(req.params.id);
        const pool = getPool();

        const result = await pool.request()
            .input("product_id", sql.Int, productId)
            .query(`
                SELECT 
                    p.*,
                    r.restraunt_name
                FROM products p
                LEFT JOIN restraunt r
                    ON p.restraunt_id = r.restraunt_id
                WHERE p.product_id = @product_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            product: result.recordset[0]
        });

    } catch (error) {
        console.error("Get Product By ID Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
}

// POST /api/products - Create a new product
async function createProduct(req, res) {
    try {
        const {
            restraunt_id,
            product_name,
            product_price,
            product_descript,
            category_id
        } = req.body;

         // Get admin/user ID from JWT
        const user_id = req.user.user_id;

        console.log("Logged-in user:", req.user);
        console.log("User ID:", user_id);

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in authentication token"
            });
        }

        const pool = getPool();

        // Foreign Key validation check
        const checkRestaurant = await pool.request()
            .input("restraunt_id", sql.Int, restraunt_id)
            .query(`
                SELECT restraunt_id 
                FROM restraunt 
                WHERE restraunt_id = @restraunt_id
            `);

        if (checkRestaurant.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: `Restaurant with ID ${restraunt_id} does not exist.`
            });
        }

        const product_image = req.file
            ? `/uploads/products/${req.file.filename}`
            : null;

        const result = await pool.request()
            .input("restraunt_id", sql.Int, restraunt_id)
            .input("user_id", sql.Int, user_id)
            .input("product_name", sql.VarChar, product_name)
            .input("product_price", sql.Decimal(10, 2), product_price)
            .input("product_descript", sql.VarChar, product_descript || null)
            .input("category_id", sql.VarChar, category_id || null)
            .input("product_image", sql.VarChar, product_image)
            .query(`
                INSERT INTO products
                (
                    restraunt_id,
                    user_id,
                    product_name,
                    product_price,
                    product_descript,
                    category_id,
                    product_image
                )
                OUTPUT INSERTED.*
                VALUES
                (
                    @restraunt_id,
                    @user_id,
                    @product_name,
                    @product_price,
                    @product_descript,
                    @category_id,
                    @product_image
                )
            `);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: result.recordset[0]
        });

    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
}

// DELETE /api/products/:id - Delete a product
async function deleteProduct(req, res) {
    try {
        const productId = Number(req.params.id);
        const pool = getPool();

        const result = await pool.request()
            .input("product_id", sql.Int, productId)
            .query(`
                DELETE FROM products 
                WHERE product_id = @product_id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
}

// GET /api/products/restaurant/:restaurantId - Get products by restaurant
async function getProductsByRestaurant(req, res) {
    try {
        const restraunt_id = Number(req.params.restaurantId);
        const pool = getPool();

        const result = await pool.request()
            .input("restraunt_id", sql.Int, restraunt_id)
            .query(`
                SELECT * 
                FROM products 
                WHERE restraunt_id = @restraunt_id
            `);

        res.json({
            success: true,
            products: result.recordset
        });

    } catch (error) {
        console.error("Get Products By Restaurant Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products for restaurant"
        });
    }
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    getProductsByRestaurant
};