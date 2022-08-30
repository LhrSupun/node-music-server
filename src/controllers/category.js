const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Category = require('../models/Category');

const auth = require('../middleware/auth');
const {
    validateInput,
} = require('../middleware/common-functions')
const { CategorySchema } = require('../validations/Category')

const router = express.Router();

// @route POST api/category/
// @desc create new category
// @access Private Admin
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const validData = validateInput(CategorySchema, req.body);
        if (!validUser.value) {
            return res.status(403).json(validData);
        }
        const { name } = validData.value;
        const ifExists = await Category.findOne({ name }).collation({ locale: 'en', strength: 2 })
        if (ifExists) {
            return res.status(401).json({ message: `category ${name} already exists!` });
        }

        const category = new Category({
            name,
            createdBy: ObjectId(req.user.userId)
        })

        await category.save();
        return res.status(200).json({
            message: "Category Created Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route GET api/category/
// @desc get categories
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        let categories = [];
        if (req.user.role === "admin") {
            categories = await Category.find().select("_id name status");
        } else if (req.user.role === "user") {
            categories = await Category.find({
                status: true
            }).select("_id name");
        }
        return res.status(200).json({ categories });
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route GET api/category/:id
// @desc get category by id
// @access Private
router.get('/:id', auth, async (req, res) => {
    try {
        let category = {};
        const _id = ObjectId(id);
        if (req.user.role === "admin") {
            category = await Category.findById({ _id }).select("_id name status");
        } else if (req.user.role === "user") {
            category = await Category.findOne({
                _id,
                status: true
            }).select("_id name");
        }
        return res.status(200).json({ category });
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route PUT api/category/:id
// @desc update category by id
// @access Private
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const validData = validateInput(CategorySchema, req.body);
        if (!validUser.value) {
            return res.status(403).json(validData);
        }
        let { name, status } = validData.value;
        name = name.toLowerCase();
        const ifExists = await Category.findById({ _id: req.params.id });
        if (!ifExists) {
            return res.status(401).json({ message: `category ${name} does not exists!` });
        }

        await Category.findByIdAndUpdate({
            _id: ifExists._id
        }, {
            name,
            status,
            createdBy: ObjectId(req.user.userId)
        });
        return res.status(200).json({
            message: "Category updated Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route DELETE api/category/:id
// @desc delete category by id
// @access Private
router.delete('/:id', auth, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(404).json("invalid id");
        }
        if (req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const _id = ObjectId(req.params.id);
        const ifExists = await Category.findById({ _id });
        if (!ifExists) {
            return res.status(401).json({ message: `category does not exists!` });
        }

        await Category.findByIdAndDelete(_id);
        return res.status(200).json({
            message: "Category deleted Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});






module.exports = router;