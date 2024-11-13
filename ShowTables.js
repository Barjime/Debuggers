const sqlite3 = require('sqlite3').verbose();

// Path to your SQLite database file (corrected)
const dbPath = './database.db';

// Connect to the SQLite database
let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// Function to get the list of tables in the database
db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
        if (err) {
            console.error('Error fetching tables:', err.message);
            return;
        }
        console.log('Tables in the database:');
        tables.forEach(table => {
            console.log(table.name);
        });
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database connection:', err.message);
        return;
    }
    console.log('Database connection closed.');
});