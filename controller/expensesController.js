const { Op } = require("sequelize");
const db = require("../models");

module.exports = {
  findUsers: async (req, res) => {
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
  },

  getAllProducts: (req, res) => {
    try {
      let sql = "SELECT * FROM products;";
      if (req.query.product_name) {
        sql = `SELECT * FROM products WHERE product_name = ?;`;
      }
      db.query(sql, (err, result) => {
        if (err) throw err;

        return res.status(200).json({
          message: "Get all products",
          data: result,
        });
      });
    } catch (err) {
      return res.status(500).json({
        message: "Server Error",
      });
    }
  },
  deleteProducts: (req, res) => {
    const { id } = req.params;
    for (let i = 0; i < productData.length; i++) {
      if (productData[i].id == id) {
        productData.splice(i, 1);
        res.status(200).json({
          message: "Product deleted",
          data: productData,
        });
      }
    }
    res.status(404).json({
      message: "Product not found",
      data: productData,
    });
  },
  getProductsById: (req, res) => {
    let { idReq } = req.params.id;
    try {
      let sql = `SELECT * FROM products WHERE id = ?;`;
      db.query(sql, [idReq], (err, result) => {
        if (err) throw err;

        return res.status(200).json({
          message: "Get all products from ID: " + idReq,
          data: result[0],
        });
      });
    } catch (err) {
      return res.status(500).json({
        message: "Server Error",
      });
    }
  },
  // for (let product of productData) {
  //   if (req.params.id == product.id) return res.send(product);
  // }
  // return res.status(204).send("Product not Found");
  // Untuk mendapatkan data yg specifik biasanya menggunakan params
  // Kalau di express sama
  // console.log(req.params.id)
  // console.log(req.query)
  // res.send(productData[req.params.id -1])
  // },
  postData: (req, res) => {
    try {
      // let sql = `INSERT INTO products (product_name, price, stock) VALUES ("${req.body.product_name}", ${req.body.price}, ${req.body.stock})`;
      let sql = `INSERT INTO products (product_name, price, stock) VALUES (?, ?, ?)`;
      db.query(
        sql,
        [req.body.product_name, req.body.price, req.body.stock],
        (err) => {
          if (err) throw err;

          return res.status(201).json({
            message: "Product created",
          });

          // Raw Query
          // Query Builder
          // Object Relational Mapping
        }
      );
    } catch (err) {
      return res.status(500).json({
        message: "Server Error",
      });
    }
  },
  // editProductById: (req, res) => {
  //   const { id } = req.params

  //   for ( let i = 0; i < productData.length; i++){
  //     if (productData[i].id == req.params.id){

  //     }
  //   }
  // }

  // ====================================================
  // Batas controller baru
  createExpense: async (req, res) => {
    try {
      
      // console.log(req.user)
      const findUserByID = await db.User.findOne({
        where: {
          id: req.user.id,
          },
      });
      console.log(findUserByID)
      if (findUserByID.isVerified == false){
        return res.status(401).json({
          message:"User is not verified yet"
        })
      }

      const { amount, categoryId, userId } = req.body;
      const today = new Date();
      await db.Expense.create({
        amount,
        CategoryId: categoryId,
        UserId: req.user.id,
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      });

      return res.status(201).json({
        message: "Created expense",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  getTotalExpenses: async (req, res) => {
    try {
      const { group, fromDate, toDate } = req.query;

      if (group === "category") {
        const getTotalExpensesByCategory = await db.Expense.findAll({
          attributes: [
            [db.sequelize.fn("sum", db.sequelize.col("amount")), "Sum_amount"],
            "Category.category_name",
          ],
          include: [{ model: db.Category }],
          group: "categoryId",
        });

        // const [getTotalExpensesByCategory] = await db.sequelize.query(
        //   `SELECT SUM(amount) AS sum_amount, c.category_name FROM Expenses e
        //   JOIN Categories c on c.id = e.CategoryId
        //   GROUP BY e.CategoryId`
        // )

        return res.status(200).json({
          message: "Get total expenses by category",
          data: getTotalExpensesByCategory,
        });
      }

      if (group === "day" || group === "month" || group === "year") {
        const getTotalExpensesByTimePeriod = await db.Expense.findAll({
          attributes: [
            [db.sequelize.fn("sum", db.sequelize.col("amount")), "sum_amount"],
            group,
          ],
          group,
        });

        return res.status(200).json({
          message: "Get total expenses by " + group,
          data: getTotalExpensesByTimePeriod,
        });
      }

      if (!group && fromDate && toDate) {
        const getTotalExpensesByDateRange = await db.Expense.findAll({
          where: {
            createdAt: {
              [Op.between]: [fromDate, toDate],
            },
          },
          attributes: [
            [db.sequelize.fn("sum", db.sequelize.col("amount")), "sum_amount"],
          ],
        });

        return res.status(200).json({
          message: "Get total expenses by date range",
          data: getTotalExpensesByDateRange,
        });
      }

      return res.status(400).json({
        message: "Missing group, fromDate, or toDate parameters",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  loginUser: async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;

      const findUserByUsernameOrEmail = await db.User.findOne({
        where: {
          [Op.or]: {
            username: usernameOrEmail,
            email: usernameOrEmail,
          },
        },
      });

      if (!findUserByUsernameOrEmail) {
        return res.status(400).json({
          message: "Username or email not found",
        });
      }

      if (findUserByUsernameOrEmail.is_suspended) {
        return res.status(400).json({
          message: "Failed to login, your account is suspended",
        });
      }

      if (findUserByUsernameOrEmail.password !== password) {
        // findUserByUsernameOrEmail.login_attempts += 1
        // findUserByUsernameOrEmail.save()

        if (findUserByUsernameOrEmail.login_attempts > 2) {
          findUserByUsernameOrEmail.is_suspended = true;
          findUserByUsernameOrEmail.save();

          return res.status(400).json({
            message: "Wrong password, your account has been suspended",
          });
        }

        await db.User.increment("login_attempts", {
          where: {
            [Op.or]: {
              username: usernameOrEmail,
              email: usernameOrEmail,
            },
          },
        });

        return res.status(400).json({
          message: "Wrong password",
        });
      }

      delete findUserByUsernameOrEmail.dataValues.password;

      findUserByUsernameOrEmail.login_attempts = 0;
      findUserByUsernameOrEmail.save();

      return res.status(200).json({
        message: "Login successful",
        data: findUserByUsernameOrEmail,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  findAll: async (req, res) => {
    try {
      const expenses = await db.Expense.findAll();
      return res.status(200).json({
        message: "Data collected successful",
        data: expenses,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  findMe: async (req, res) => {
    try {
      const expenses = await db.Expense.findAll({
        where: {
          userId: req.user.id,
        }
      });
      return res.status(200).json({
        message: "Data collected successful",
        data: expenses,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  findByID: async (req, res) => {
    const { id } = req.params;
    try {
      const expenses = await db.Expense.findByPk(id);
      return res.status(200).json({
        message: "Data filtered successful",
        data: expenses,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  deleteExpense: async (req, res) => {
    const { id } = req.params;
    try {
      await db.Expense.destroy({
        where: {
          id: id,
        },
      });
      return res.status(200).json({
        message: "Data deleted",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  updateExpense: async (req, res) => {
    try {
      const { id } = req.params;
      await db.Expense.update(req.body, {
        where: {
          id: id,
        },
      });
      return res.status(200).json({
        message: "Data updated successfully",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  // createExpenseByToken: async (req, res) => {
  //   try {
  //     req.user.id 
  //     const { amount, } = req.body;
      

  //     if (!findUserByUsernameOrEmail) {
  //       return res.status(400).json({
  //         message: "User not found",
  //       });
  //   }
    
  //     const passwordValid = bcrypt.compareSync(
  //       password,
  //       findUserByUsernameOrEmail.password
  //     );
      
  //     if (!passwordValid) {
  //         return res.status(400).json({
  //           message: "Password invalid",
  //         });
  //     }
  //     delete findUserByUsernameOrEmail.dataValues.password

  //     const token = signToken({
  //       id: findUserByUsernameOrEmail.id
  //     })
      
  //     return res.status(201).json({
  //       message: "Login successfully to this acc!",
  //       data: findUserByUsernameOrEmail,
  //       token,
  //     });

  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).json({
  //       message: "Server error",
  //     });
  //   }
  // },
};
