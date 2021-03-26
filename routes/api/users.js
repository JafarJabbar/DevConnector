const app = require('express');
const {check, validationResult} = require('express-validator');
const router = app.Router();
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const User = require('../../models/User')
const config = require('config')


// @route  POST /api/users/
// @desc   Register user
// @access Public
router.post('/', [
        check('name', 'Please enter full name.').not().isEmpty(),
        check('email', 'Please enter valid email address').isEmail(),
        check('password', 'Password must be longer 6 symbols.').isLength({min: 6}),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let {name, email, password} = req.body;

        try {
            //Get if user exists
            let userExist = await User.findOne({email});
            if (userExist) {
                return res.status(400).json({errors: [{'msg': `User with ${email} already exists.`}]})
            }


            //Get gravatar image
            let avatar = gravatar.url(email, {
                s: '200',
                r: 'gp',
                d: 'mm'
            })

            const user = new User({
                name,
                email,
                avatar,
                password
            })


            //Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            //Send jsonwebtoken to frontend
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 36000},
                (err, token) => {
                    if(err) throw err;
                    return res.json({token});
                })


        } catch (err) {
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }

    });

module.exports = router;