// index.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./Configration/db");
const departmentRoutes = require("./Routes/dashboardRouter");
const adminRouter = require("./Routes/adminRouter");
const employeeRouter = require("./Routes/employeeRouter");
const attendanceRoutes = require("./Routes/attendanceRoutes");
const apiRoutes = require("./Routes/apiRoutes");
const placesRouter = require("./Routes/placesRouter");

const morgan = require("morgan");
const app = express();

app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

app.use(
  morgan((tokens, req, res) => {
    const status = res.statusCode;

    let color = "\x1b[37m";

    if (status >= 500) color = "\x1b[31m";
    else if (status >= 400) color = "\x1b[33m";
    else if (status >= 200) color = "\x1b[32m";

    const log = [
      tokens.method(req, res),
      tokens.url(req, res),
      status,
      tokens["response-time"](req, res) + " ms",
    ].join(" ");

    return color + log + "\x1b[0m";
  }),
);

app.use("/api/departments", departmentRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/places", placesRouter);
app.use("/api", apiRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log(" MongoDB connected");

    app.listen(PORT, () => {
      console.log(` Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" DB connection failed:", err);
  });

// npm i nodemon === >   nodmon
// npm install mongoose
// npm install bcrypt
// npm install jsonwebtoken
