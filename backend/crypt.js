const bcrypt = require("bcryptjs");

const hashedPassword = await bcrypt.hash(
            '12345',
            12
        );

        console.log(hashedPassword);