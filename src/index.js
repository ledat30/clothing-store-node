import express from "express";
import initApiRouter from "./routes/api.js";
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import connection from "./config/connectDB.js";
import configCors from "./config/cors.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 8080;

//config cors
configCors(app);

//config body-parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

//db
connection();

//config cookie-parser
app.use(cookieParser());

//init web router
initApiRouter(app);

app.listen(PORT, () => {
  console.log(`>>>Jwt backend is running at http://localhost:${PORT}`);
});