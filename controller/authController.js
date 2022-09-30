const { Op } = require("sequelize");
const db = require("../models");
const bcrypt = require("bcrypt");
const { signToken } = require("../lib/jwt");
const { validationResult } = require("express-validator");
const emailer = require("../lib/emailer");
const handlebars = require('handlebars')
const fs = require('fs');
const { validateVerificationToken, createVerificationToken } = require("../lib/verification");

const User = db.User;

const authController = {
  registerUser: async (req, res) => {
    //1. Check username and email unique
    //2. Daftar
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Cannot be empty",
        });
      }

      const { username, email, password } = req.body;
      const findUserByUsernameOrEmail = await User.findOne({
        where: {
          [Op.or]: {
            username,
            email,
          },
        },
      });
      if (findUserByUsernameOrEmail) {
        return res.status(400).json({
          message: "Username or email has been used",
        });
      }
      const hashedPasword = bcrypt.hashSync(password, 5);

      const newUser = await User.create({
        username,
        email,
        password: hashedPasword,
      });

      const token = signToken({
        id: newUser.id,
      });

      const verificationToken = createVerificationToken({
        id: newUser.id
      })
      const verificationLink = `http://localhost:2000/auth/verification?verification_token=${verificationToken}`


      const rawHTML = fs.readFileSync("templates/register_user.html", "utf-8");
      const compileHTML = handlebars.compile(rawHTML);
      const result = compileHTML({
        username: username,
        verificationLink,
      });

      await emailer({
        to: email,
        html: result,
        subject: "Test Email",
        text: "Halo dunia",
      });

      return res.status(201).json({
        message: "User created!",
        data: newUser,
        token,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  loginUsers: async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      const findUserByUsernameOrEmail = await User.findOne({
        where: {
          [Op.or]: {
            username: usernameOrEmail,
            email: usernameOrEmail,
          },
        },
      });
      if (!findUserByUsernameOrEmail) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const passwordValid = bcrypt.compareSync(
        password,
        findUserByUsernameOrEmail.password
      );

      if (!passwordValid) {
        return res.status(400).json({
          message: "Password invalid",
        });
      }
      delete findUserByUsernameOrEmail.dataValues.password;

      const token = signToken({
        id: findUserByUsernameOrEmail.id,
      });

      return res.status(201).json({
        message: "Login successfully to this acc!",
        data: findUserByUsernameOrEmail,
        token,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const findUserById = await User.findByPk(req.user.id);

      const renewToken = signToken({
        id: req.user.id,
      });
      return res.status(200).json({
        message: "Renewed user token",
        data: findUserById,
        token: renewToken,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },

  editUserProfile: async (req, res) => {
    try {
      if (req.file) {
        req.body.profile_picture_url = `http://localhost:2000/public/${req.file.filename}`;
      }

      const findUserByUsernameOrEmail = await User.findOne({
        where: {
          [Op.or]: {
            username: req.body.username || "",
            email: req.body.email || "",
          },
        },
      });

      if (findUserByUsernameOrEmail) {
        return res.status(400).json({
          message: "Username has been taken",
        });
      }
      await User.update(
        { ...req.body },
        {
          where: {
            id: req.user.id,
          },
        }
      );

      const findUserByID = await User.findByPk(req.user.id);
      return res.status(200).json({
        message: "Edited successfully",
      });
    } catch (err) {}
  },
  verifyUser: async (req, res) => {
    try {
      const { verification_token } = req.query
      const validToken = validateVerificationToken(verification_token)
      
      if (!validToken){
        res.status(401).json({
          message: "Token invalid"
        })
      }

      await User.update(
        {is_verified: true}, {
        where: {
          id: validToken.id
        }
      })

      //Redirect ke page tertentu
      // return res.redirect('http://localhost:3000/login')
      return res.status(200).json({
        message: "User verified"
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  verifyUserResend: async (req, res) => {
    try {
      const verificationToken = createVerificationToken({
        id: req.user.id
      })
      const verificationLink = `http://localhost:2000/auth/verification?verification_token=${verificationToken}`


      const userSaatIni = await User.findByPk(req.user.id)
      const rawHTML = fs.readFileSync("templates/register_user_resend.html", "utf-8");
      const compileHTML = handlebars.compile(rawHTML);
      const result = compileHTML({
        username: userSaatIni.username,
        verificationLink,
      });
      // console.log()


      await emailer({
        to: userSaatIni.email,
        html: result,
        subject: "Resend Token Email",
        text: "Halo dunia",
      });
      

      return res.status(200).json({
        message: "Resend successfully"
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
};

module.exports = authController;
