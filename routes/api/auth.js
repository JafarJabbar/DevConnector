const app = require('express');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const router = app.Router();

// @route  POST /api/auth/
// @desc   Auth route
// @access Public
router.get('/',
    auth,
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (err) {
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });


// @route  POST /api/auth/
// @desc   Login user
// @access Public
router.post('/', [
        check('email', 'Please enter valid email address').isEmail(),
        check('password', 'Please enter password').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let {email, password} = req.body;

        try {
            //Get if user exists
            const user = await User.findOne({email});
            if (!user) {
                return res.status(400).json({msg: "Invalid credentials"})
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({msg: "Invalid credentials"})
            }

            //Send jsonwebtoken to frontend
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 36000},
                (err, token) => {
                    if (err) throw err;
                    return res.json({token});
                })


        } catch (err) {
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }

    });


module.exports = router;