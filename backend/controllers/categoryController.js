const { sql, getPool } = require("../config/db.js");


async function getCategories(req, res) {

    try {

        const pool = getPool();

        const result = await pool.request().query(`
            SELECT *
            FROM category
            ORDER BY category_name
        `);


        res.json({
            success: true,
            categories: result.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
}



async function createCategory(req, res) {

    try {

        const {
            category_name
        } = req.body;


        if (!category_name) {

            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }


        const pool = getPool();


        const result = await pool.request()

            .input(
                "category_name",
                sql.VarChar,
                category_name
            )

            .query(`

                INSERT INTO category(category_name)

                OUTPUT INSERTED.*

                VALUES(@category_name)

            `);


        res.status(201).json({
            success: true,
            message: "Category created",
            category: result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create category"
        });
    }
}



async function deleteCategory(req, res) {

    try {

        const categoryId = Number(req.params.id);

        const pool = getPool();


        await pool.request()

            .input(
                "category_id",
                sql.Int,
                categoryId
            )

            .query(`
                DELETE FROM category
                WHERE category_id = @category_id
            `);


        res.json({
            success: true,
            message: "Category deleted"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete category"
        });
    }
}


module.exports = {
    getCategories,
    createCategory,
    deleteCategory
};