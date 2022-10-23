const router = require('express').Router();
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth');
const sequelize = require('../config/connection');

// Render Posts with Auth
router.get('/', withAuth, async(req, res) => {
    try {
        const postData = await Post.findAll({
            where: {
                user_id: req.session.user_id
            },
            attributes: [
                'id',
                'title',
                'post_text',
                'created_at'
            ],
            include: [
                {
                model: Comment,
                attributes: ['id', 'comment_text', 'user_id', 'post_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
                },
                {
                model: User,
                attributes: ['username']
                }
            ]
        });

        const posts = postData.map((posts) => posts.get({ plain: true }));

        res.render('dashboard', {
            posts,
            loggedIn: req.session.loggedIn,
        });

    } catch(err){
        res.status(500).json(err);
    }
});

// Render Edit page
router.get('/edit/:id', withAuth, async (req,res) => {
    try {
        const postData = await Post.findOne({
            where: { 
                id: req.params.id
            },
            attributes: [
                'id',
                'title',
                'post_text',
                'created_at'
            ],
            include: [
                {
                model: Comment,
                attributes: ['id', 'comment_text', 'user_id', 'post_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
                },
                {
                model: User,
                attributes: ['username']
                }
            ]
        });

        if (!postData) {
            res.status(404).json({ message: 'No Post Found'})
        };

        const posts = postData.get({ plain: true });

        res.render('editPost', {
            posts,
            loggedIn: req.session.loggedIn,
        });

    } catch (err) {
        res.status(500).json(err)
    }
});

// Render New Post
router.get('/newpost', (req, res) => {
    res.render('newPosts', {
        loggedIn: req.session.loggedIn,
    });

});

module.exports = router;