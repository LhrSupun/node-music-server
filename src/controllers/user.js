const express = require("express");

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        return res.status(200).json({
            message: "it's working"
        });
    } catch (error) {
        return res.status(500).json("500 Internal Server Error");
    }
})

module.exports = router;