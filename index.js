require("dotenv").config();
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const morgan = require("morgan");

const app = express();
const http = require("http").createServer(app);

// db connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// middlewares
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// route middlewares

// routes

fs.readdirSync("./routes").map((r) =>
  app.use("/api", require(`./routes/${r}`))
);

app.get("/", (req, res) => {
  res.send("LINKS DAILY");
});

const port = process.env.PORT || 8000;

http.listen(port, () => console.log("Server running on port 8000"));
