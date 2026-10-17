const {
    sql,
    getPool
} = require("../config/db.js");


// =====================================================
// TIME PARSER
// =====================================================

function parseTimeToDate(timeStr) {

    if (!timeStr) {
        return null;
    }

    if (timeStr instanceof Date) {
        return timeStr;
    }

    const cleanTime =
        String(timeStr).trim();

    const parts =
        cleanTime.split(":");

    if (parts.length < 2) {
        return null;
    }

    const hours =
        parseInt(
            parts[0],
            10
        );

    const minutes =
        parseInt(
            parts[1],
            10
        );

    const seconds =
        parts[2]
            ? parseInt(
                parts[2],
                10
            )
            : 0;


    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        Number.isNaN(seconds)
    ) {
        return null;
    }


    if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59 ||
        seconds < 0 ||
        seconds > 59
    ) {
        return null;
    }


    return new Date(
        Date.UTC(
            1970,
            0,
            1,
            hours,
            minutes,
            seconds
        )
    );

}


// =====================================================
// GET ALL RESTAURANTS
// =====================================================

async function getRestaurants(
    req,
    res
) {

    try {

        const pool =
            getPool();

        const result =
            await pool
                .request()
                .query(`

                    SELECT

                        restraunt_id,

                        restraunt_name,

                        restraunt_gstN,

                        owner_name,

                        address,

                        contact_num,

                        image,

                        opening_time,

                        closing_time,

                        is_open,

                        created_at

                    FROM restraunt

                    ORDER BY
                        restraunt_id DESC

                `);


        res.json({

            success:
                true,

            restaurants:
                result.recordset

        });

    }
    catch (error) {

        console.error(
            "Get Restaurants Error:",
            error
        );

        res.status(500).json({

            success:
                false,

            message:
                "Failed to fetch restaurants"

        });

    }

}


// =====================================================
// GET RESTAURANT BY ID
// =====================================================

async function getRestaurantById(
    req,
    res
) {

    try {

        const id =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid restaurant ID"

            });

        }


        const pool =
            getPool();


        const restaurantResult =
            await pool
                .request()

                .input(
                    "restraunt_id",
                    sql.Int,
                    id
                )

                .query(`

                    SELECT *

                    FROM restraunt

                    WHERE
                        restraunt_id =
                        @restraunt_id

                `);


        if (
            restaurantResult
                .recordset
                .length === 0
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Restaurant not found"

            });

        }


        const productsResult =
            await pool
                .request()

                .input(
                    "restraunt_id",
                    sql.Int,
                    id
                )

                .query(`

                    SELECT *

                    FROM products

                    WHERE
                        restraunt_id =
                        @restraunt_id

                `);


        res.json({

            success:
                true,

            restaurant:
                restaurantResult
                    .recordset[0],

            products:
                productsResult
                    .recordset

        });

    }
    catch (error) {

        console.error(
            "Get Restaurant By ID Error:",
            error
        );

        res.status(500).json({

            success:
                false,

            message:
                "Failed to fetch restaurant"

        });

    }

}


// =====================================================
// CREATE RESTAURANT
// =====================================================

async function createRestaurant(
    req,
    res
) {

    try {

        // =================================================
        // GET DATA FROM REQUEST
        // =================================================

        const {

            restraunt_name,

            restraunt_gstN,

            owner_name,

            address,

            contact_num,

            opening_time,

            closing_time

        } = req.body;


        console.log(
            "Restaurant request body:",
            req.body
        );


        // =================================================
        // VALIDATE RESTAURANT NAME
        // =================================================

        if (
            !restraunt_name ||
            !String(
                restraunt_name
            ).trim()
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Restaurant name is required"

            });

        }


        // =================================================
        // VALIDATE GST
        // =================================================

        if (
            !restraunt_gstN ||
            !String(
                restraunt_gstN
            ).trim()
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Restaurant GSTN is required"

            });

        }


        // =================================================
        // VALIDATE OWNER
        // =================================================

        if (
            !owner_name ||
            !String(
                owner_name
            ).trim()
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Owner name is required"

            });

        }


        // =================================================
        // VALIDATE ADDRESS
        // =================================================

        if (
            !address ||
            !String(
                address
            ).trim()
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Restaurant address is required"

            });

        }


        // =================================================
        // VALIDATE CONTACT
        // =================================================

        const contactString =
            String(
                contact_num ?? ""
            ).trim();


        if (
            !/^[0-9]{10}$/.test(
                contactString
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Contact number must contain exactly 10 digits"

            });

        }


        // =================================================
        // VALIDATE OPENING TIME
        // =================================================

        const parsedOpeningTime =
            parseTimeToDate(
                opening_time
            );


        if (!parsedOpeningTime) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid opening time"

            });

        }


        // =================================================
        // VALIDATE CLOSING TIME
        // =================================================

        const parsedClosingTime =
            parseTimeToDate(
                closing_time
            );


        if (!parsedClosingTime) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid closing time"

            });

        }


        // =================================================
        // DATABASE CONNECTION
        // =================================================

        const pool =
            getPool();


        // =================================================
        // IMAGE
        // =================================================

        const image =
            req.file
                ? `/uploads/restaurants/${req.file.filename}`
                : null;


        // =================================================
        // INSERT RESTAURANT
        // =================================================

        const result =
            await pool
                .request()

                .input(
                    "restraunt_name",
                    sql.VarChar(255),
                    String(
                        restraunt_name
                    ).trim()
                )

                .input(
                    "restraunt_gstN",
                    sql.VarChar(255),
                    String(
                        restraunt_gstN
                    ).trim()
                )

                .input(
                    "owner_name",
                    sql.VarChar(255),
                    String(
                        owner_name
                    ).trim()
                )

                .input(
                    "address",
                    sql.VarChar(255),
                    String(
                        address
                    ).trim()
                )

                .input(
                    "contact_num",
                    sql.BigInt,
                    contactString
                )

                .input(
                    "image",
                    sql.VarChar(255),
                    image
                )

                .input(
                    "opening_time",
                    sql.Time,
                    parsedOpeningTime
                )

                .input(
                    "closing_time",
                    sql.Time,
                    parsedClosingTime
                )

                .query(`

                    INSERT INTO restraunt
                    (

                        restraunt_name,

                        restraunt_gstN,

                        owner_name,

                        address,

                        contact_num,

                        image,

                        opening_time,

                        closing_time,

                        is_open

                    )

                    OUTPUT INSERTED.*

                    VALUES
                    (

                        @restraunt_name,

                        @restraunt_gstN,

                        @owner_name,

                        @address,

                        @contact_num,

                        @image,

                        @opening_time,

                        @closing_time,

                        'yes'

                    )

                `);


        // =================================================
        // SUCCESS
        // =================================================

        res.status(201).json({

            success:
                true,

            message:
                "Restaurant created successfully",

            restaurant:
                result.recordset[0]

        });

    }
    catch (error) {

        console.error(
            "Create Restaurant Error:",
            error
        );


        // =================================================
        // DUPLICATE VALUE
        // =================================================

        if (
            error.number === 2627 ||
            error.number === 2601
        ) {

            return res.status(409).json({

                success:
                    false,

                message:
                    "Restaurant name, GSTN, or contact number already exists."

            });

        }


        // =================================================
        // OTHER DATABASE ERROR
        // =================================================

        res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Failed to create restaurant"

        });

    }

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getRestaurants,

    getRestaurantById,

    createRestaurant

};