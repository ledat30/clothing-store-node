"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AttributeValue extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            AttributeValue.belongsTo(models.Product, { foreignKey: "productId" });
            AttributeValue.hasMany(models.OrderItem, { foreignKey: "category_id" });
        }
    }
    AttributeValue.init(
        {
            productId: DataTypes.INTEGER,
            color: DataTypes.STRING,
            size: DataTypes.STRING,
            quantity: DataTypes.STRING,
            isDelete: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "AttributeValue",
        }
    );
    return AttributeValue;
};
