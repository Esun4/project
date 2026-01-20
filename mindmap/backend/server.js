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
app.use(express.json({ limit: "50mb" }));




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

app.get("/auth/me", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const result = await pool.query(
            "SELECT id, name, username, email FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Session user not found" });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error("auth/me error:", err);
        res.status(500).json({ error: "Server error" });
    }
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

app.post("/mindmaps", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const { id, title, data, thumbnail } = req.body; 
        if (!data) return res.status(400).json({ error: "Missing mindmap data" });

        // FIX 1: Ensure 'data' is a JSON string for the JSONB column
        // If data is already a string, keep it; if it's an object, stringify it.
        const flowData = typeof data === "string" ? data : JSON.stringify(data);

        const numericId = parseInt(id);

        let existingMap = null;
        if (!isNaN(numericId)) {
            const check = await pool.query(
                "SELECT id FROM mindmaps WHERE id = $1 AND user_id = $2",
                [numericId, userId]
            );
            existingMap = check.rows[0];
        }

        if (existingMap) {
            const result = await pool.query(
                `UPDATE mindmaps 
                 SET title = $1, data = $2, thumbnail = $3, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $4 AND user_id = $5
                 RETURNING id`,
                [title || "Untitled", flowData, thumbnail || null, numericId, userId]
            );
            return res.json({ id: result.rows[0].id, message: "Updated!" });
        } else {
            const result = await pool.query(
                `INSERT INTO mindmaps (user_id, title, data, thumbnail)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id`,
                [userId, title || "Untitled", flowData, thumbnail || null]
            );
            return res.status(201).json({ id: result.rows[0].id });
        }
    } catch (err) {
        console.error("Save mindmap error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// get all the mindmaps of the user
app.get("/mindmaps", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const result = await pool.query(
            `SELECT id, title, thumbnail, data, created_at, updated_at
            FROM mindmaps
            WHERE user_id = $1
            ORDER BY updated_at DESC`,
            [userId]
        );

        res.json({ mindmaps: result.rows });
    } catch (err) {
        console.error("List mindmaps error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// open the selected mindmap
app.get("/mindmaps/:id", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid mindmap id" });
        }

        const result = await pool.query(
            `SELECT id, title, data, created_at, updated_at
       FROM mindmaps
       WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Mindmap not found" });
        }

        res.json({ mindmap: result.rows[0] });
    } catch (err) {
        console.error("Get mindmap error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// delete a mindmap
app.delete("/mindmaps/:id", async (req, res) => {
    const userId = req.session.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        await pool.query("DELETE FROM mindmaps WHERE id = $1 AND user_id = $2", [id, userId]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});



app.post("/echo", (req, res) => {
    res.json({ youSent: req.body });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});