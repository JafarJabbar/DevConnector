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
            const profile = await Profile.findOne({user: req.user.id});
            const user = await User.findById(req.user.id).select('-password');
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
            const posts = await Post.find().sort({date: -1});
            return res.send(posts);
        } catch (err) {
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });

// @route  GET /api/posts/:id
// @desc   Get post by id
// @access Public
router.get('/:id',
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (!post){
                return res.status(404).json({'msg': 'There is no post by this id'})
            }
            return res.send(post);
        } catch (err) {
            if (err.kind === 'ObjectId'){
                return res.status(404).json({'msg': 'There is no post by this id'})
            }

            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });

// @route  DELETE /api/posts/:id
// @desc   Delete post
// @access Private
router.delete('/:id',
    auth,
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (!post){
                return res.status(404).json({'msg': 'There is no post by this id'})
            }
            if (post.user.toString()!==req.user.id){
                return res.status(401).json({'msg': 'User not authorized'})
            }
            await post.remove();
            return res.send({'msg':"Post removed successfully"});
        } catch (err) {
            if (err.kind === 'ObjectId'){
                return res.status(404).json({'msg': 'There is no post by this id'})
            }
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });

// @route  PUT /api/posts/like/:id
// @desc   Like post route
// @access Private
router.put('/like/:id',auth,async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post){
            return res.status(404).json({'msg': 'There is no post by this id'})
        }

        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({'msg': 'You already liked this post'})
        }

        post.likes.unshift({user:req.user.id});

        await post.save();
        return res.send(post.likes);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({'msg': 'There is no post by this id'})
        }
        console.log(err.message)
        res.status(500).json({msg: 'Undefined server error! Please try again later.'})
    }
});

// @route  PUT /api/posts/unlike/:id
// @desc   Unlike post route
// @access Private
router.put('/unlike/:id',auth,async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post){
            return res.status(404).json({'msg': 'There is no post by this id'})
        }

        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({'msg': 'You have not been like yet'})
        }

        const removedIndex = post.likes.map(like=>like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removedIndex,1);
        await post.save();
        return res.send(post);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({'msg': 'There is no post by this id'})
        }
        console.log(err.message)
        res.status(500).json({msg: 'Undefined server error! Please try again later.'})
    }
});

// @route  PUT /api/posts/comment/:id
// @desc   Create new comment for post
// @access Private
router.put('/comment/:id', [
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
            const post = await Post.findById(req.params.id);
            const user = await User.findById(req.user.id);

            if (!post){
                return res.status(404).json({'msg': 'There is no post by this id'})
            }

            const newComment = {
                text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);
            await post.save();
            return res.send(post)
        } catch (err) {
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }


    });

// @route  Delete /api/posts/comment/:id/:comment_id
// @desc   Delete post comment
// @access Private
router.delete('/comment/:id/:comment_id',auth,
    async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user.id);
        if (!post){
            return res.status(404).json({'msg': 'There is no post by this id'})
        }
        const comment = post.comments.find(comment=>comment.id.toString() === req.params.comment_id);
        if (!comment){
            return res.status(404).json({'msg': 'There is no comment by this id'})
        }

        if (comment.user.toString()!==req.user.id){
            return res.status(401).json({'msg': 'User not authorized'})
        }

        const removedIndex = post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removedIndex,1);
        await post.save();
        return res.send(post);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({'msg': 'There is no post by this id'})
        }
        console.log(err.message)
        res.status(500).json({msg: 'Undefined server error! Please try again later.'})
    }
});


module.exports = router;