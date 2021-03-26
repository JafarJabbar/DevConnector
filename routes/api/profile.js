const app = require('express');
const config = require('config');
const request = require('request');
const router = app.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  GET /api/profile/me
// @desc   Get Profile info by token
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(404).json({'msg': 'There is no profile for this user.'})
        }
        res.send(profile);
    } catch (err) {
        console.log(err.message)
        res.status(500).json({msg: 'Undefined server error! Please try again later.'})
    }
});


// @route  POST /api/profile
// @desc   Create and update new profile
// @access Private
router.post('/',
    [
        auth,
        [check('status', 'Status is required').not().isEmpty(), check('skills', 'Skills is required').not().isEmpty()]
    ],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            instagram,
            facebook,
            twitter,
            linkedin
        } = req.body;

        let profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;

        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }

        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (twitter) profileFields.social.twitter = twitter;

        try {
            let profile = await Profile.findOne({user: req.user.id});
            if (profile) {
                await Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields},
                    {new: true})
            }
            profile = new Profile(profileFields);
            await profile.save();
            return res.send(profile);
        } catch (err) {
            console.log(err.message)
            res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });


// @route  GET /api/profile
// @desc   Get all profiles
// @access Private
router.get('/',
    async (req, res) => {
        try {
            let profiles = await Profile.find().populate('user', ['name', 'avatar']);
            if (!profiles) {
                return res.status(404).json({'msg': 'There is no profile.'})
            }
            return res.json(profiles);
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });

// @route  GET /api/profile/user/:user_id
// @desc   Get profile by user_id
// @access Private
router.get('/user/:user_id',
    async (req, res) => {
        try {
            let profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
            if (!profile) {
                return res.status(404).json({'msg': 'There is no profile.'})
            }
            return res.json(profile);
        } catch (err) {
            console.log(err.message)
            if (err.kind === 'ObjectId') {
                return res.status(404).json({'msg': 'There is no profile.'})
            }
            return res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });

// @route  DELETE /api/profile/
// @desc   DELETE user and profile
// @access Private
router.delete('/',
    auth,
    async (req, res) => {
        try {
            await Profile.findOneAndRemove({user: req.user.id});
            await User.findOneAndRemove({_id: req.user.id});
            return res.json({msg: 'User deleted successfully!'});
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    });

// @route  PUT /api/profile/experience
// @desc   Put experience to user profile
// @access Private
router.put('/experience',
    [
        auth,
        [
            check('title', 'Title is required.').not().isEmpty(),
            check('company', 'Company is required.').not().isEmpty(),
            check('from', 'From date is required.').not().isEmpty(),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        const {
            company,
            title,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            company,
            title,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({user: req.user.id});
            profile.experience.unshift(newExp);
            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    }
);

// @route  DELETE /api/profile/experience/:experience_id
// @desc   Delete experience from
// @access Private
router.delete('/experience/:experience_id',
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({user: req.user.id});
            const removedIndex = profile.experience.map(item => item.id).indexOf(req.params.experience_id);
            profile.experience.splice(removedIndex, 1);
            await profile.save();

            return res.json(profile);
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    }
);

// @route  PUT /api/profile/education
// @desc   Put education to user profile
// @access Private
router.put('/education',
    [
        auth,
        [
            check('school', 'School is required.').not().isEmpty(),
            check('fieldOfStudy', 'Field of study is required.').not().isEmpty(),
            check('degree', 'Degree is required.').not().isEmpty(),
            check('from', 'From date is required.').not().isEmpty(),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        const {
            school,
            fieldOfStudy,
            degree,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            fieldOfStudy,
            degree,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({user: req.user.id});
            profile.education.unshift(newEdu);
            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    }
);

// @route  DELETE /api/profile/education/:education_id
// @desc   Delete education from
// @access Private
router.delete('/education/:education_id',
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({user: req.user.id});
            const removedIndex = profile.education.map(item => item.id).indexOf(req.params.education_id);
            profile.education.splice(removedIndex, 1);
            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    }
);

// @route  GET /api/profile/github/:github_username
// @desc   Get repos by github username
// @access Public
router.get('/github/:github_username',
    async (req, res) => {
        try {

            const options = {
                uri: `https://api.github.com/users/${req.params.github_username}/repos?per_page=50&sort=created:asc&client_id=${config.get('githubClientToken')}&client_secret=${config.get('githubSecret')}`,
                method: 'GET',
                headers: {'user-agent': 'node.js'}
            }
            request(options, (error, response, body) => {
                if (error) console.error(error);
                if (response.statusCode !== 200) {
                    res.status(404).json({'msg': 'No github profile found!'});
                }
                res.send(JSON.parse(body));
            })
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({msg: 'Undefined server error! Please try again later.'})
        }
    }
);


module.exports = router;