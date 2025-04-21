import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize, DataTypes } from "sequelize";
import process from "process";

const __filename = fileURLToPath(import.meta.url); // Define __filename
const __dirname = path.dirname(__filename); // Define __dirname
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = (await import(`../config/config.json`, { with: { type: "json" } })).default[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const files = fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  });

for (const file of files) {
  const model = (await import(path.join(__dirname, file))).default(sequelize, DataTypes);
  db[model.name] = model;
}

for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;