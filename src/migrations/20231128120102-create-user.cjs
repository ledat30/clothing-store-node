"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phonenumber: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      isDelete: {
        type: Sequelize.STRING,
      },
      provinceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Provinces",
          key: "id",
        },
      },
      districtId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Districts",
          key: "id",
        },
      },
      wardId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Wards",
          key: "id",
        },
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
      },
      otpCode: {
        type: Sequelize.STRING,
      },
      otpExpiry: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
