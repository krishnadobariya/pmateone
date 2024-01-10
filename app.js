const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const pino = require("express-pino-logger")();

const port = process.env.PORT || 8000;
require("dotenv").config();
const http = require("http")
const httpServer = http.createServer(app);


app.use(cors());
app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: true,
    parameterLimit: 1000000,
  })
);
app.use(bodyParser.json({ limit: "200mb" }));
app.use(pino);

app.use((req, res, next) => {
  next();
});

//1XDwBT1KZe2kVpqr
// const MONGODB_URL = 'mongodb://localhost:27017/petrolPump'
const MONGODB_URL = 'mongodb+srv://pmateone:1XDwBT1KZe2kVpqr@cluster0.u90pobd.mongodb.net/petrolPump'

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to %s", MONGODB_URL);
    console.log("App with mongoDb is running ... \n");
    console.log("Press CTRL + C to stop the process. \n");
  })
  .catch((err) => {
    console.error("App starting error:", err.message);
    process.exit(1);
  });
const db = mongoose.connection;


require("./src/Routes")(app);

const jsn = { Status: "Your Server Is Started Now" };
app.get('/*', (req, res) => {
  res.send(jsn);
});

httpServer.listen(port, () => {
  console.log("Server started Port", port);
});



