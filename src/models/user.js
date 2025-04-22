"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Province, { foreignKey: "provinceId" });
      User.belongsTo(models.District, { foreignKey: "districtId" });
      User.belongsTo(models.Ward, { foreignKey: "wardId" });
      User.hasMany(models.Order, { foreignKey: "userId" });
      User.hasMany(models.Review, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      role: DataTypes.STRING,
      provinceId: DataTypes.INTEGER,
      districtId: DataTypes.INTEGER,
      wardId: DataTypes.INTEGER,
      email: DataTypes.STRING,
      phonenumber: DataTypes.STRING,
      password: DataTypes.STRING,
      isDelete: DataTypes.STRING,
      isVerified: DataTypes.BOOLEAN,
      otpCode: DataTypes.STRING,
      otpExpiry: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
