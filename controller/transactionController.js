const { Op } = require("sequelize");
const db = require("../models");
const handlebars = require("handlebars");
const fs = require("fs");
const emailer = require("../lib/emailer.js");
const moment = require("moment");

const Trans = db.Transactions;
const TransItems = db.TransactionItems;

const transactionController = {
  paymentItems: async (req, res) => {
    try {
      let { items } = req.body;
      const payment_proof_image_url = `http://localhost:2000/public/${req.file.filename}`;
      items = JSON.parse(items);
      // console.log(items[0].quantity)
      const dataMap = items.map((val) => {
        return val.ticketId;
      });
      // console.log(dataMap)
      const dataItems = await db.Ticket.findAll({
        where: {
          id: dataMap,
        },
      });
      // console.log(dataItems[0].price)
      let newTransactionItems = [];
      let totalPriceCalc = 0;
      for (let i = 0; i < dataItems.length; i++) {
        const quantity = items.find(
          (item) => item.ticketId === dataItems[i].id
        ).quantity;
        totalPriceCalc += quantity * dataItems[i].price;

        newTransactionItems.push({
          price_per_pcs: dataItems[i].price,
          quantity,
          total_price: quantity * dataItems[i].price,
          TicketId: dataItems[i].id,
        });
      }
      // console.log(totalPriceCalc);

      const createNewTransaction = await Trans.create({
        payment_proof_image_url,
        total_price: totalPriceCalc,
        UserId: req.user.id,
      });

      const filledTransactionItems = await TransItems.bulkCreate(
        newTransactionItems.map((item) => {
          return {
            ...item,
            TransactionId: createNewTransaction.id,
          };
        })
      );

      // console.log(findTransItem);

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
  paymentStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (status !== "accepted" && status !== "rejected") {
        return res.status(400).json({
          message: "Invalid status error",
        });
      }

      const findUser = await db.User.findByPk(req.user.id);
      if (!findUser.isAdmin) {
        return res.status(401).json({
          message: "User unauthorized. Only admin",
        });
      }
      
      await Trans.update(
        { status },
        {
          where: {
            id,
          },
        }
      );

      if (status === "accepted") {
        // Data Needed
        // -Current date
        // -Transaction Items
        // -Grand total
        const invoiceDate = moment().format("DD MMMM YYYY");

        const findTransByID = await Trans.findByPk(id, {
          include: [{ model: db.User }]
        })

        const findTransItems = await TransItems.findAll({
          where: {
            TransactionId: id,
          },
          include: [{ model: db.Ticket }]
        })

        const transactionItems = findTransItems.map((item) => {
          return {
            event_name: item.Ticket.event_name,
            quantity: item.quantity,
            total_price: item.total_price.toLocaleString()
          }
          })
        const rawHTML = fs.readFileSync("templates/invoice.html", "utf-8");
        const compileHTML = handlebars.compile(rawHTML);
        const result = compileHTML({
          invoiceDate,
          grandTotal: findTransByID.total_price.toLocaleString(),
          transactionItems,
        });

        await emailer({
          to: findTransByID.User.email,
          html: result,
          subject: "Ticketing Invoice",
          text: "Your Invoice",
        })
      }

      return res.status(200).json({
        message: `${status} transaction`,
      });
    } catch (err) {
      console.log(err)
      return res.status(500).send("Error")
    }
  },
};

module.exports = transactionController;
