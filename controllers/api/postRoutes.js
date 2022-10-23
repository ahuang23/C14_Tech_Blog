const router = require('express').Router();
const { Post, User, Comment} = require('../../models');
const withAuth = require('../../utils/auth');
const sequelize = require('../../config/connection');

// GET All Posts
router.get('/', async (req, res) => {
    try {
    const postData = await Post.findAll({
      attributes: ['id', 
                   'post_text',
                   'title',
                   'created_at'
                ],
      order: [['created_at', 'DESC']],
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
          },
      ]
    }) 
      res.json(postData);
    
    } catch(err) {
      console.log(err);
      res.status(500).json(err);
    }
});

// GET a Single Post by ID
router.get('/:id', async (req, res) => {
    try {
      const postData = await Post.findOne({
        where: {
          id: req.params.id
        },
        attributes: ['id', 
                    'post_text', 
                    'title',
                    'created_at'
                  ],
        include: [
          {
            model: User,
            attributes: ['username']
          },
          {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
              model: User,
              attributes: ['username']
            }
          }
        ]
    })
        
      if (!postData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
        
        res.json(postData);
      
      } catch (err) {
          console.log(err);
          res.status(500).json(err);
      }
  });

// CREATE New Post
router.post('/', withAuth, async (req, res) => {
    try {
      const postData = await Post.create({ 
        title: req.body.title,
        post_text: req.body.post_text,
        user_id: req.session.user_id
    })
        res.json(postData);

  } catch(err){
    console.log(err);
    res.status(500).json(err); 
  }

});

// UPDATE Post
router.put('/:id', withAuth, async (req, res) => {
  try{
    const postData = await Post.update({
        title: req.body.title,
        post_text: req.body.post_text
      },
      {
        where: {
          id: req.params.id
        }
    });
        if (!postData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(postData);
        console.log(postData);

    } catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});

// DELETE Post 
router.delete('/:id', withAuth, async (req, res) => {
    try {
      const postData = await Post.destroy({
        where: {
            id: req.params.id 
        }
    });
        if (!postData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }

        res.json(postData);

    } catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;

