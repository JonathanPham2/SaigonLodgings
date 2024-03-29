const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs")

const { setTokenCookie, restoreUser} = require("../../utils/auth")
const { User } = require("../../db/models")

const router = express.Router();

// log in

const {check} = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
// validate middleware
const validateLogin = [
    check("credential")
    .exists({checkFalsy: true})
    .notEmpty()
    .withMessage("Please provide valid email or username"),
    check("password")
    .exists({checkFalsy:true})
    .withMessage("Please provide password"),
    handleValidationErrors
];
router.post("/",validateLogin, async (req, res, next) => {
    
    const { credential, password } =  req.body;
    
    const user = await User.unscoped().findOne({
        where: {
            [Op.or]: {
                username: credential,
                email: credential
            }
            
        }
        
    });
    
    if(!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        const err = new Error ("Login failed")
        err.title = "Login failed";
        err.status = 401
        err.errors = {credential: "The provided credentials were invalid"}
        return next(err)
    }
    
    const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email:user.email,
        username: user.username

    };
    
    setTokenCookie(res, safeUser)
    return res.json({
        user: safeUser
    })
    
    
    
})

router.delete("/", (_req, res) => {
    res.clearCookie("token");
    return res.json({
        message: "success"
    })
})

router.get("/",(req, res) => {
    
    // destructing user from request
    const { user } = req;
    // assuming restoreUser middleware alreay check..
    if(user) {
        const safeUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email
        }
        return res.json({
            user:safeUser
        })
    }
    else return res.json({user: null})
})




// log in




module.exports = router