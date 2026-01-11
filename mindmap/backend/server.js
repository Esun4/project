const express = require("express");
// lets frontend call the backend that's on a different port
const cors = require("cors");
// creates login sessions using cookies
const session = require("express-session");
// hashes passwords to keep secure
const bcrypt = require("bcrypt");
// manages connections to the database
const { Pool } = require("pg");

// creates the server
const app = express();
app.use(express.json());

// allows requrests from a different port
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// server sends a cookie to the browswer with the session id, and on future logins it sends the cookie back and the server finds ur seesion
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
