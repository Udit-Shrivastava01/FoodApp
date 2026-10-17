const bcrypt = require("bcryptjs");
const { sql, getPool } = require("../config/db.js");
const generateToken = require("../utils/generateToken.js");


async function register(req, res) {

    try {

        const {
            username,
            email,
            password,
            contact,
            address
        } = req.body;


        if (
            !username ||
            !email ||
            !password ||
            !contact ||
            !address
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }


        const pool = getPool();


        const existingUser = await pool.request()
            .input("email", sql.VarChar, email)
            .query(`
                SELECT user_id
                FROM users
                WHERE email = @email
            `);


        if (existingUser.recordset.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }


        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        const result = await pool.request()

            .input("username", sql.VarChar, username)
            .input("email", sql.VarChar, email)
            .input("hashed_pass", sql.VarChar, hashedPassword)
            .input("contact", sql.BigInt, contact)
            .input("address", sql.VarChar, address)

            .query(`
                INSERT INTO users
                (
                    username,
                    email,
                    hashed_pass,
                    contact,
                    address,
                    role
                )

                OUTPUT
                    INSERTED.user_id,
                    INSERTED.username,
                    INSERTED.email,
                    INSERTED.contact,
                    INSERTED.address,
                    INSERTED.role

                VALUES
                (
                    @username,
                    @email,
                    @hashed_pass,
                    @contact,
                    @address,
                    'user'
                )
            `);


        const user = result.recordset[0];

        const token = generateToken(user);


        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
}



async function login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }


        const pool = getPool();


        const result = await pool.request()

            .input("email", sql.VarChar, email)

            .query(`
                SELECT *
                FROM users
                WHERE email = @email
            `);


        if (result.recordset.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        const user = result.recordset[0];

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );
        console.log(hashedPassword);
        const passwordMatch = await bcrypt.compare(
            password,
            user.hashed_pass
        );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        const token = generateToken(user);


        delete user.hashed_pass;


        res.json({
            success: true,
            message: "Login successful",
            token,
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
}



async function getProfile(req, res) {

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
                    user_id,
                    username,
                    email,
                    contact,
                    address,
                    role,
                    created_at,
                    user_image

                FROM users

                WHERE user_id = @user_id
            `);


        if (result.recordset.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        res.json({
            success: true,
            user: result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not fetch profile"
        });
    }
}


module.exports = {
    register,
    login,
    getProfile
};