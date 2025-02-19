const express = require("express");
const bodyPaser = require("body-parser");
const cors = require("cors");
const errorHandler = require("errorhandler");
const apiRouter = require("./api/api");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyPaser.json());
app.use(cors());

app.use("/api", apiRouter);

app.use(errorHandler());

app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});

module.exports = app;