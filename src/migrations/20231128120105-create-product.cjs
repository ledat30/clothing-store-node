"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Products", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
            },
            description: {
                type: Sequelize.STRING,
            },
            isDelete: {
                type: Sequelize.STRING,
            },
            view_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            image: {
                type: Sequelize.BLOB("long"),
            },
            price: {
                type: Sequelize.STRING,
            },
            contentHtml: {
                type: Sequelize.TEXT("long"),
                allowNull: true,
            },
            contentMarkdown: {
                type: Sequelize.TEXT("long"),
                allowNull: true,
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Categories",
                    key: "id",
                },
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
        await queryInterface.dropTable("Products");
    },
};
