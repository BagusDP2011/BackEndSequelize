const express = require("express");
const dotenv = require("dotenv");
const db = require("./models/index.js");
const { Op } = require("sequelize");
const cors = require('cors')
const fs = require("fs")


dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.use(cors())
app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const findAllUsers = await db.User.findAll({
      where: {
        ...req.query,
        username: {
          [Op.like]: `%${req.query.username || ""}%`,
        },
      },
      //   attributes: ["id", "username"]
      attributes: { exclude: ["id", "username"] },
    });

    res.status(200).json({
      message: "Find All Users",
      data: findAllUsers,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const createUser = await db.User.create({ ...req.body });
    res.status(201).json({
      message: "Created User",
      data: createUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
});
app.post("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const findUser = await db.User.findByPk(id);

    if (!findUser) {
      return res.status(400).json({
        message: "User with ID not found",
      });
    }

    await db.User.update(req.body, {
      Where: {
        id: id,
      },
    });
    res.status(200).json({
      message: "Updated User",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
});
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.User.destroy({
      Where: {
        id: id,
      },
    });
    res.status(200).json({
      message: "Updated User",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
});
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const findUserByID = await db.User.findByPk(id, {
      include: [{ model: db.Expense }],
    });

    res.status(200).json({
      message: "User Found",
      data: findUserByID,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
});

app.post("/users/register", async (req, res) => {
  try {
    const { email, username, password, passwordConfirm } = req.body;
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password needs more than 8 char" });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Password does not match" });
    }
    const findUserByUsernameOrEmail = await db.User.findOne({
      where: {
        [Op.or]: {
           username: username , 
           email: email,
      },
      },
    });
    if (findUserByUsernameOrEmail) {
      return res
        .status(400)
        .json({ message: "Username or email has been taken" });
    }
    
    await db.User.create ({
      username,
      email,
      password,
    })
    
    return res
      .status(201)
      .json({ message: "User registered" });
  
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
});

app.get("/users/register", async (req, res) => {
  try {
    const { email, username, password, passwordConfirm } = req.body;
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password needs more than 8 char" });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Password does not match" });
    }
    const findUserByUsernameOrEmail = await db.User.findOne({
      where: {
        [Op.or]: {
           username: username, 
           email: email,
      },
      },
    });
    if (findUserByUsernameOrEmail) {
      return res
        .status(400)
        .json({ message: "Username or email has been taken" });
    }
    
    await db.User.create ({
      username,
      email,
      password,
    })
    
    return res
      .status(201)
      .json({ message: "User registered" });
  
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
});


const expensesRoute = require ("./routes/expensesRoute")

const verifyToken = require("./middllewares/authMiddleware.js");
app.use("/expenses", expensesRoute)

const authRoute = require("./routes/authRoute.js");
app.use("/auth", authRoute)

const postRoute = require("./routes/postRoute.js");
app.use("/post", 
// verifyToken,
 postRoute)

app.use("/public", express.static("public"))

app.listen(PORT, () => {
  db.sequelize.sync({ alter: true });

  if (!fs.existsSync("public")) {
    fs.mkdirSync("public")
  }

  console.log("Listening to port: ", PORT);
});
 
