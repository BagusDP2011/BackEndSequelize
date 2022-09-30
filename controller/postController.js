const { Op } = require("sequelize");
const db = require("../models");

const Post = db.Post;

const postController = {
  postingData: async (req, res) => {

    try {
      const { body } = req.body;
      const image_url = `http://localhost:2000/public/${req.file.filename}`
      await Post.create({
        body,
        image_url,
        UserId: req.user.id,
        username: req.user.username

      });
      
      return res.status(201).json({
        message: "Post created!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
},
showAllData: async (req, res) => {
    try {
        // const { _limit = 5, _page = 1, _sortDir = "DESC" } = req.query

      //   const findAllPosts = await Post.findAndCountAll({
      //   include: [{ model: db.User }],
      //   limit: Number(_limit),
      //   offset: (_page - 1) * _limit,
      //   order: [
      //     ["createdAt", _sortDir]
      //   ]
      // })
          const findAllPosts = await Post.findAll({
            include: [{ model: db.User }]
          })
        // console.log(findAllPosts)

        return res.status(200).json({
            message: "Showing Data!",
            data: findAllPosts,
            dataCount: findAllPosts.count,
          });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
          message: "Server error",
        });
        
    }
  }
};

module.exports = postController;
