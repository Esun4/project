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



const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(session({
    // cookie info (session info will go inside the cookie)
    name: "sid",
    // ****** This needs to be changed when hosting the web app ******************************************************************
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    // ****** This needs to be changed when hosting the web app ******************************************************************
    // eventually, put a secret in a .env, pass it into docker and remove the fallback (line above)
    // ex. SESSION_SECRET=super_long_random_string_here
    // secret: process.env.SESSION_SECRET
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    },
}));


app.get("/health", (req, res) => {
    res.json({ ok: true });
});

app.get("/db-test", async (req, res) => {
    const result = await pool.query("SELECT NOW()");

    res.json({ time: result.rows[0].now });
})

app.post("/auth/signup", async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // checks if the username or the email already exists
        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Email or username already in use" });
        }

        // hashes the password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // insert the user into the database
        const result = await pool.query(
            `INSERT INTO users (name, username, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, username, email`,
            [name, username, email, passwordHash]
        );

        // send safe response
        const user = result.rows[0];
        return res.status(201).json({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
        });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

app.post("/auth/login", async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({ error: "Missing credentials" });
        }

        // find the user by their email or by their username
        const result = await pool.query(
            "SELECT id, name, username, email, password_hash FROM users WHERE email = $1 OR username = $1",
            [emailOrUsername]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = result.rows[0];

        // compare password to hashed one matching the username
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // create the session
        req.session.userId = user.id;

        // return the user info (not password)
        return res.json({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

app.get("/auth/me", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: "Not logged in" });
        }

        const result = await pool.query(
            "SELECT id, name, username, email FROM users WHERE id = $1",
            [req.session.userId]
        );

        return res.json(result.rows[0]);
    } catch (err) {
        console.error("Me error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

app.post("/echo", (req, res) => {
    res.json({ youSent: req.body });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});