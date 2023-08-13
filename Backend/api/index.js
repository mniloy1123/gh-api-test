const router = require('express').Router()

router.use('/metrics', require('./metrics'))


//404 handling
router.use((req, res, next) => {
    const error = new Error("404 Not Found")
    error.status = 404;
    next(error);
})

module.exports = router;