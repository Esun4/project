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

app.post("/echo", (req, res) => {
    res.json({ youSent: req.body });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});