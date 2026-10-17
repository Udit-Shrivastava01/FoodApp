const { sql, getPool } = require("../config/db.js");


async function getDeliveryPartners(req, res) {

    try {

        const pool = getPool();


        const result = await pool.request().query(`

            SELECT *
            FROM delivery_partners

            ORDER BY del_part_id DESC

        `);


        res.json({
            success: true,
            delivery_partners: result.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch delivery partners"
        });
    }
}



async function createDeliveryPartner(req, res) {

    try {

        const {
            del_part_name,
            contact_number,
            email,
            vehicle_number
        } = req.body;


        const pool = getPool();


        const result = await pool.request()

            .input(
                "del_part_name",
                sql.VarChar,
                del_part_name
            )

            .input(
                "contact_number",
                sql.BigInt,
                contact_number
            )

            .input(
                "email",
                sql.VarChar,
                email
            )

            .input(
                "vehicle_number",
                sql.VarChar,
                vehicle_number
            )

            .query(`

                INSERT INTO delivery_partners
                (
                    del_part_name,
                    contact_number,
                    email,
                    vehicle_number,
                    availability_status
                )

                OUTPUT INSERTED.*

                VALUES
                (
                    @del_part_name,
                    @contact_number,
                    @email,
                    @vehicle_number,
                    'available'
                )

            `);


        res.status(201).json({
            success: true,
            message: "Delivery partner created",
            delivery_partner: result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not create delivery partner"
        });
    }
}



async function updateAvailability(req, res) {

    try {

        const id = Number(req.params.id);

        const {
            availability_status
        } = req.body;


        if (
            ![
                "available",
                "not available"
            ].includes(availability_status)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid availability status"
            });
        }


        const pool = getPool();


        await pool.request()

            .input(
                "del_part_id",
                sql.Int,
                id
            )

            .input(
                "availability_status",
                sql.VarChar,
                availability_status
            )

            .query(`

                UPDATE delivery_partners

                SET availability_status = @availability_status

                WHERE del_part_id = @del_part_id

            `);


        res.json({
            success: true,
            message: "Availability updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update availability"
        });
    }
}


module.exports = {
    getDeliveryPartners,
    createDeliveryPartner,
    updateAvailability
};