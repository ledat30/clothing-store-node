"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class Contact extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Contact.init(
        {
            name: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Contact",
        }
    );
    return Contact;
};
