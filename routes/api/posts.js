const app = require('express');
const {check, validationResult} = require('express-validator');
const router = app.Router();
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');


// @route  POST /api/posts/
// @desc   Create new post
// @access Private
router.post('/', [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        try {
            const text = req.body.text;
            const profile = Profile.findOne({user: req.user.id});
            const user = User.findById(req.user.id).select('-password');

            const newPost = {
                text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            const post = new Post(newPost);
            await post.save();
            res.send(post)
        } catch (err) {
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }


    });

// @route  GET /api/posts/
// @desc   Get all posts
// @access Public
router.get('/',
    async (req, res) => {
        try {
            const posts = Post.find().sort({date: -1});
            return res.send(posts);
        } catch (err) {
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });


module.exports = router;