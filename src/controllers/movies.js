const express = require("express");
const { ObjectId } = require("mongodb");
const Category = require('../models/Category');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');

const {
    MovieCreateSchema,
    MovieUpdateSchema
} = require('../validations/Movies')

const {
    validateInput,
} = require('../middleware/common-functions')

const router = express.Router();

const checkCategories = async (categories) => {
    // check category ids are valid
    const tempArray = categories.map(e => ObjectId(e));
    const validCategories = await Category.find({ _id: { $in: [...tempArray] } }).count();
    if (categories.length !== validCategories) {
        return true;
    } else {
        return false;
    }
}

// @route POST api/movies/
// @desc add a new movie
// @access Private
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const validData = validateInput(MovieCreateSchema, req.body);
        if (!validData.value) {
            return res.status(403).json(validData);
        }
        const {
            title,
            categories,
            year,
            price,
            description,
            thumbnail,
        } = validData.value;

        const ifExists = await Movie.findOne({ title }).collation({ locale: 'en', strength: 2 })
        if (ifExists) {
            return res.status(401).json({ message: `movie ${title} already exists!` });
        }

        const check = await checkCategories(categories);
        if (check) {
            return res.status(401).json({ message: `categories does not exists!` });
        }

        const movie = new Movie({
            title,
            categories: categories.map(e => ({ _id: e })),
            year,
            price,
            description,
            thumbnail,
            createdBy: ObjectId(req.user.userId)
        })

        await movie.save();
        return res.status(200).json({
            message: "Movie Added Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route GET api/movies/
// @desc get all movies
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        let movies = [];
        const aggregation_admin = [
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories._id',
                    foreignField: '_id',
                    as: 'category_name'
                }

            }, {
                $project: {
                    title: 1,
                    _id: 1,
                    category_name: {
                        name: 1,
                        _id: 1
                    },
                    year: 1,
                    price: 1,
                    description: 1,
                    description: 1,
                    status: 1
                }
            }
        ];
        const aggregation_user = [
            {
                $match: {
                    status: true
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories._id',
                    foreignField: '_id',
                    as: 'category_name'
                }

            }, {
                $project: {
                    title: 1,
                    _id: 1,
                    category_name: {
                        name: 1,
                        _id: 1
                    },
                    year: 1,
                    price: 1,
                    description: 1,
                    description: 1,
                    status: 1
                }
            }
        ];
        if (req.user.role === "admin") {
            movies = await Movie.aggregate(aggregation_admin);
        } else if (req.user.role === "user") {
            movies = await Movie.aggregate(aggregation_user);
        }
        return res.status(200).json(movies);
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route GET api/movies/:id
// @desc get movie by id
// @access Private
router.get('/:id', auth, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(401).json({ message: `movie does not exists!` });
        }
        let movie = {};
        const _id = ObjectId(req.params.id);
        const aggregation_admin = [
            {
                $match: {
                    _id: _id,
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories._id',
                    foreignField: '_id',
                    as: 'category_name'
                }

            }, {
                $project: {
                    title: 1,
                    _id: 1,
                    category_name: {
                        name: 1,
                        _id: 1
                    },
                    year: 1,
                    price: 1,
                    description: 1,
                    description: 1,
                    status: 1
                }
            }
        ];
        const aggregation_user = [
            {
                $match: {
                    status: true,
                    _id: _id,
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories._id',
                    foreignField: '_id',
                    as: 'category_name'
                }

            }, {
                $project: {
                    title: 1,
                    _id: 1,
                    category_name: {
                        name: 1,
                        _id: 1
                    },
                    year: 1,
                    price: 1,
                    description: 1,
                    description: 1,
                    status: 1
                }
            }
        ];

        if (req.user.role === "admin") {
            movie = await Movie.aggregate(aggregation_admin);
        } else if (req.user.role === "user") {
            movie = await Movie.aggregate(aggregation_user);
        }
        return res.status(200).json(movie);
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route PUT api/movies/:id
// @desc update movie by id
// @access Private
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(401).json({ message: `movie does not exists!` });
        }

        const validData = validateInput(MovieUpdateSchema, req.body);
        if (!validData.value) {
            return res.status(403).json(validData);
        }
        const {
            title,
            categories,
            year,
            price,
            description,
            thumbnail,
        } = validData.value;

        const ifExists = await Movie.findById({ _id: ObjectId(req.params.id) });
        if (!ifExists) {
            return res.status(401).json({ message: `movie does not exists!` });
        }
        const updateData = {
            title,
            year,
            price,
            description,
            thumbnail,
            createdBy: ObjectId(req.user.userId)
        }

        if (categories) {
            const check = await checkCategories(categories);
            if (check) {
                return res.status(401).json({ message: `categories does not exists!` });
            }
            updateData.categories = categories.map(e => ({ _id: e }));
        }

        await Movie.findByIdAndUpdate({ _id: ifExists._id }, updateData);
        return res.status(200).json({
            message: "Movie updated Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route DELETE api/movies/:id
// @desc delete movie by id
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
        const ifExists = await Movie.findById({ _id });
        if (!ifExists) {
            return res.status(401).json({ message: `category does not exists!` });
        }

        await Movie.findByIdAndDelete(_id);
        return res.status(200).json({
            message: "Movie deleted Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

module.exports = router;