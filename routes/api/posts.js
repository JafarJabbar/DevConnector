const app=require('express');
const router = app.Router();

// @route  GET /api/posts/
// @desc   Posts route
// @access Public
router.get('/',(req,res)=>{
    res.send('Posts routes')
});

module.exports = router;