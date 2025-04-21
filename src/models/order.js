"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: "userId" });
      Order.belongsTo(models.Province, { foreignKey: "provinceId" });
      Order.belongsTo(models.District, { foreignKey: "districtId" });
      Order.belongsTo(models.Ward, { foreignKey: "wardId" });
      Order.hasMany(models.OrderItem, { foreignKey: "orderId" });
    }
  }
  Order.init(
    {
      total_amount: DataTypes.STRING,
      payment_method: DataTypes.INTEGER,
      status: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      provinceId: DataTypes.INTEGER,
      districtId: DataTypes.INTEGER,
      wardId: DataTypes.INTEGER,
      address_detail: DataTypes.STRING,
      phonenumber: DataTypes.STRING,
      customerName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
