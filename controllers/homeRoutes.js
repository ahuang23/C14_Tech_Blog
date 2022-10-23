const { Post, User, Comment } = require('../models');
const router = require('express').Router();
const sequelize = require('../config/connection');


// Render Posts
router.get('/', async (req, res) => {
    try {
        const postData = await Post.findAll({
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

        res.render('homepage', {
            posts,
            loggedIn: req.session.loggedIn,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}); 

// Render Log In page
router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }

    res.render('login');
});

// Render Sign Up page
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Render Single Post
router.get('/post/:id', async (req, res) => {
    try {
        const postData =  await Post.findOne({
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
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
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
        }
        
        const posts = postData.get({ plain: true });
        console.log(posts)
        res.render('singlePost', {
            posts,
            loggedIn: req.session.loggedIn,
        });
 
    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;

