const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

let sessions = {};  // In-memory session store for simplicity

// Register a new user
const registerUser = (username, email, password, callback) => {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);
        const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.run(query, [username, email, hash], function (err) {
            if (err) return callback(err);
            callback(null, { userId: this.lastID });
        });
    });
};

// Login a user and create a session
const loginUser = (email, password, callback) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err) return callback(err);
        if (!user) return callback(null, false);
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return callback(err);
            if (!isMatch) return callback(null, false);
            const sessionId = `session-${user.user_id}`;
            sessions[sessionId] = user;
            callback(null, { sessionId, userId: user.user_id });
        });
    });
};

// Logout a user by deleting their session
const logoutUser = (sessionId, callback) => {
    if (sessions[sessionId]) {
        delete sessions[sessionId];
        callback(null, { success: true });
    } else {
        callback(null, { success: false, message: "User not logged in" });
    }
};

// Check if a user is logged in
const isLoggedIn = (sessionId) => {
    return !!sessions[sessionId];
};

// Add an allergy or dietary restriction for a user
const addAllergy = (userId, allergyName, callback) => {
    db.get(`SELECT allergy_id FROM allergies WHERE allergy_name = ?`, [allergyName], (err, allergy) => {
        if (err) return callback(err);
        if (!allergy) {
            db.run(`INSERT INTO allergies (allergy_name) VALUES (?)`, [allergyName], function (err) {
                if (err) return callback(err);
                const allergyId = this.lastID;
                db.run(`INSERT INTO user_allergies (user_id, allergy_id) VALUES (?, ?)`, [userId, allergyId], callback);
            });
        } else {
            db.run(`INSERT INTO user_allergies (user_id, allergy_id) VALUES (?, ?)`, [userId, allergy.allergy_id], callback);
        }
    });
};

// Remove an allergy for a user
const removeAllergy = (userId, allergyName, callback) => {
    const query = `
        DELETE FROM user_allergies 
        WHERE user_id = ? AND allergy_id = (SELECT allergy_id FROM allergies WHERE allergy_name = ?)
    `;
    db.run(query, [userId, allergyName], function (err) {
        if (err) return callback(err);
        callback(null, this.changes > 0);
    });
};

// List all allergies and dietary restrictions for a user
const listUserAllergies = (userId, callback) => {
    const query = `
        SELECT a.allergy_name
        FROM allergies a
        JOIN user_allergies ua ON a.allergy_id = ua.allergy_id
        WHERE ua.user_id = ?
    `;
    db.all(query, [userId], (err, allergies) => {
        if (err) return callback(err);
        callback(null, allergies.map(a => a.allergy_name));
    });
};

// List all recipes, filtering based on user allergies and restrictions
const listRecipes = (userId, callback) => {
    const query = `
        SELECT DISTINCT r.recipe_name, r.instructions
        FROM recipes r
        JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
        JOIN foods f ON ri.food_id = f.food_id
        LEFT JOIN food_allergies fa ON f.food_id = fa.food_id
        LEFT JOIN user_allergies ua ON fa.allergy_id = ua.allergy_id AND ua.user_id = ?
        WHERE ua.user_id IS NULL
    `;
    db.all(query, [userId], (err, recipes) => {
        if (err) return callback(err);
        callback(null, recipes);
    });
};

// Close the database connection
const closeDatabase = () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database connection:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
};

// Export the functions
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    addAllergy,
    removeAllergy,
    listUserAllergies,
    listRecipes,
    closeDatabase,
    isLoggedIn
};