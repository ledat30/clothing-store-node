"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class Product extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Product.hasMany(models.Review, { foreignKey: "productId" });
            Product.belongsTo(models.Category, { foreignKey: "categoryId" });
            Product.hasMany(models.AttributeValue, { foreignKey: "productId" });
        }
    }
    Product.init(
        {
            name: DataTypes.STRING,
            description: DataTypes.STRING,
            image: DataTypes.BLOB("long"),
            view_count: DataTypes.INTEGER,
            price: DataTypes.STRING,
            categoryId: DataTypes.INTEGER,
            contentHtml: DataTypes.TEXT("long"),
            contentMarkdown: DataTypes.TEXT("long"),
            isDelete: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Product",
        }
    );
    return Product;
};
