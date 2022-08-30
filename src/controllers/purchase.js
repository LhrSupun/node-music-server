const express = require("express");
const { ObjectId } = require("mongodb");
const User = require('../models/User');
const Movie = require('../models/Movie');
const Purchase = require('../models/Purchase');

const auth = require('../middleware/auth');

const {
    PurchaseSchema, PurchaseUpdateSchema
} = require('../validations/Purchase')

const {
    validateInput,
} = require('../middleware/common-functions')

const router = express.Router();

const checkMovies = async (movies_array) => {
    // check movie ids are valid
    const tempArray = movies_array.map(e => ObjectId(e));
    const [validMovies, movies] = await Promise.all([
        await Movie.find({ _id: { $in: [...tempArray] } }).count(),
        await Movie.find({ _id: { $in: [...tempArray] } }).select('_id price'),
    ])
    if (movies.length !== validMovies) {
        return {
            check: true,
            price_new: [],
            total: 0,
        }
    } else {
        return {
            check: false,
            price_new: movies.map(e => ({ _id: e._id, price: e.price })),
            total: movies.reduce((a, b) => a += b.price, 0),
        }
    }
}

// @route POST api/purchase/
// @desc purchase a movie
// @access Private
router.post('/', auth, async (req, res) => {
    try {
        // if (req.user.role !== "admin") {
        //     return res.status(401).json({ message: "Unauthorized" });
        // }

        const validData = validateInput(PurchaseSchema, req.body);
        if (!validData.value) {
            return res.status(403).json(validData);
        }

        const {
            movies,
            paymentDetails,
            description
        } = validData.value;

        const { check, price_new, total } = await checkMovies(movies);
        if (check) {
            return res.status(401).json({ message: `movies does not exists!` });
        }

        const purchase = new Purchase({
            total: total,
            movies: price_new,
            paymentDetails,
            description,
            user: ObjectId(req.user.userId)
        })

        await purchase.save();
        return res.status(200).json({
            message: "Movie Purchased"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route GET api/purchase/
// @desc get purchased movies
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        let purchased = [];
        const aggregation_admin = [
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'movies',
                    localField: 'movies._id',
                    foreignField: '_id',
                    as: 'movie_details'
                }
            },
            {
                $addFields: {
                    movies: {
                        $map: {
                            input: '$movies',
                            as: 'i',
                            in: {
                                $mergeObjects: [
                                    '$$i',
                                    {
                                        title: {
                                            $reduce: {
                                                input: '$movie_details',
                                                initialValue: '',
                                                in: {
                                                    $cond: [
                                                        {
                                                            $eq: ['$$this._id', '$$i._id']
                                                        },
                                                        '$$this.title',
                                                        '$$value'
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                ]
                            }
                        },
                    },
                    movie_details: '$$REMOVE'
                },
            },
        ];
        const aggregation_user = [
            {
                $match: {
                    user: ObjectId(req.params.userId)
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'movies',
                    localField: 'movies._id',
                    foreignField: '_id',
                    as: 'movie_details'
                }
            },
            {
                $addFields: {
                    movies: {
                        $map: {
                            input: '$movies',
                            as: 'i',
                            in: {
                                $mergeObjects: [
                                    '$$i',
                                    {
                                        title: {
                                            $reduce: {
                                                input: '$movie_details',
                                                initialValue: '',
                                                in: {
                                                    $cond: [
                                                        {
                                                            $eq: ['$$this._id', '$$i._id']
                                                        },
                                                        '$$this.title',
                                                        '$$value'
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                ]
                            }
                        },
                    },
                    movie_details: '$$REMOVE'
                },

            },
        ];
        if (req.user.role === "admin") {
            purchased = await Purchase.aggregate(aggregation_admin);
        } else if (req.user.role === "user") {
            purchased = await Purchase.aggregate(aggregation_user);
        }
        return res.status(200).json(purchased);
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route GET api/purchase/:id
// @desc get purchased movies by purchase id
// @access Private
router.get('/:id', auth, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(401).json({ message: `transaction does not exists!` });
        }

        const _id = ObjectId(req.params.id);
        const aggregation = [
            {
                $match: {
                    _id: _id,
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'movies',
                    localField: 'movies._id',
                    foreignField: '_id',
                    as: 'movie_details'
                }
            },
            {
                $addFields: {
                    movies: {
                        $map: {
                            input: '$movies',
                            as: 'i',
                            in: {
                                $mergeObjects: [
                                    '$$i',
                                    {
                                        title: {
                                            $reduce: {
                                                input: '$movie_details',
                                                initialValue: '',
                                                in: {
                                                    $cond: [
                                                        {
                                                            $eq: ['$$this._id', '$$i._id']
                                                        },
                                                        '$$this.title',
                                                        '$$value'
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                ]
                            }
                        },
                    },
                    movie_details: '$$REMOVE'
                },

            },
        ];


        const purchased = await Purchase.aggregate(aggregation);
        return res.status(200).json(purchased);
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route PUT api/purchase/:id
// @desc update transaction
// @access Private
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(401).json({ message: `transaction does not exists!` });
        }

        const validData = validateInput(PurchaseUpdateSchema, req.body);
        if (!validData.value) {
            return res.status(403).json(validData);
        }
        const {
            paymentDetails,
            movies,
            description,
        } = validData.value;

        const ifExists = await Purchase.findById({ _id: ObjectId(req.params.id) });
        if (!ifExists) {
            return res.status(401).json({ message: `transaction does not exists!` });
        }
        const updateData = {
            paymentDetails,
            movies,
            description,
            user: ObjectId(req.user.userId)
        }

        if (movies) {
            const { check, price_new, total } = await checkMovies(movies);
            if (check) {
                return res.status(401).json({ message: `movies does not exists!` });
            }
            updateData.total = total;
            updateData.movies = price_new;
        }

        await Purchase.findByIdAndUpdate({ _id: ifExists._id }, updateData);
        return res.status(200).json({
            message: "Purchase updated Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route DELETE api/purchase/:id
// @desc delete transaction
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
        const ifExists = await Purchase.findById({ _id });
        if (!ifExists) {
            return res.status(401).json({ message: `Purchase does not exists!` });
        }

        await Purchase.findByIdAndDelete(_id);
        return res.status(200).json({
            message: "Purchase deleted Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});

module.exports = router;