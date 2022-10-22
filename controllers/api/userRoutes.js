const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const withAuth = require ('../../utils/auth');

// User GET Route
router.get('/', async (req, res) => {
    try {
     const userData = await User.findAll({
        attributes: { exclude: ['password'] }
        })
        res.json(userData);
    } catch(err) {
            res.status(500).json(err)
        }

});

// Single User GET Route
router.get('/:id', async (req, res) => {
    try {
        const userData = await User.findOne({
            attributes: { exclude: ['password'] },
            where: {
                id: req.params.id
            },
            include: [
                {
                    model: Post,
                    attributes: ['id', 'title', 'post_text', 'created_at'],
                },
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'created_at'],
                    include: {
                        model: Post,
                        attributes: ['title']
                    }
                }
            ]
        });

        if (!userData) {
            res.status(404).json({ message: 'No user with this ID'});
            return;
        }

        res.json(userData);

    } catch (err) {
        res.status(500).json(err);
    }
});

// User Create Route
router.post('/', async (req, res) => {
    try {
        const userData = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.username = userData.username;
            req.session.loggedIn = true;
        });

        res.json(userData);

    } catch (err) {
        res.status(500).json(err);
    }    
});

// User Login Route

router.post('/login', async (req, res) => {
   try {
    const userData = await User.findOne({
        where: {
            email: req.body.email
        }
    });
        if (!userData) {
            res.status(400).json({ message: 'No user with that email address!'});
            return;
        }

        const validPassword = userData.checkPassword(req.body.password);

        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password!' });
            return;
        }
        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.username = userData.username;
            req.session.loggedIn = true;
      
            res.json({ user: userData, message: 'You are now logged in!' });
        });
    } catch (err) {
        res.status(500).json(err);
    }
});


// User Logout Route
router.post('/logout', withAuth, (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

// // UPDATE a user 
// router.put('/:id', withAuth, (req, res) => {
//     User.update(req.body, {
//         individualHooks: true,
//         where: {
//             id: req.params.id
//         }
//     })
//     .then(dbUserData => {
//         if (!dbUserData[0]) {
//             res.status(404).json({ message: 'No user found with this id'});
//             return;
//         }
//         res.json(dbUserData);
//     })
//     .catch(err => {
//         console.log(err); 
//         res.status(500).json(err);
//     });
// });

// // DELETE a user
// router.delete('/:id', withAuth, (req, res) => {
//     User.destroy({
//         where: {
//             id: req.params.id
//         }
//     })
//         .then(dbUserData => {
//             if (!dbUserData) {
//                 res.status(404).json({ message: 'No user found with this id'});
//                 return;
//             }
//             res.json(dbUserData);
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json(err);
//         });
// });

module.exports = router;

