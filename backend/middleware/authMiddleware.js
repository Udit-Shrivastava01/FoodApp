const jwt = require("jsonwebtoken");

function protect(req, res, next) {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}


function adminOnly(req, res, next) {

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== "admin") {

        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
}

const adminMiddleware = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required."

        });

    }


    const role =
        String(
            req.user.role ||
            req.user.user_role ||
            ""
        ).toLowerCase();


    if (
        role !== "admin" &&
        role !== "administrator"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Admin access required."

        });

    }


    next();

};


module.exports = {
    protect,
    adminOnly,
    adminMiddleware
};