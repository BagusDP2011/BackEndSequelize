"use strict";
const { Model, BOOLEAN } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Expense)
      User.hasMany(models.Post)
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      loginAttempts:{
        defaultValue: 0,
        type: DataTypes.INTEGER,
      },
      isSuspended: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      profile_picture_url: DataTypes.STRING,
      isVerified: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      }
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
