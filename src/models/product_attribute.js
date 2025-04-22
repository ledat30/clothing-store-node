"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class ProductAttribute extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProductAttribute.belongsTo(models.Product, { foreignKey: "productId" });
            ProductAttribute.hasMany(models.OrderItem, { foreignKey: "category_id" });
        }
    }
    ProductAttribute.init(
        {
            productId: DataTypes.INTEGER,
            color: DataTypes.STRING,
            size: DataTypes.STRING,
            quantity: DataTypes.STRING,
            isDelete: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "ProductAttribute",
        }
    );
    return ProductAttribute;
};
