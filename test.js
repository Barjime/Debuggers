const readline = require('readline');
const {
    registerUser,
    loginUser,
    logoutUser,
    addAllergy,
    removeAllergy,
    listUserAllergies,
    listRecipes
} = require('./database');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentSessionId = null;
let currentUserId = null;

const showMenu = () => {
    console.log("\nSelect an option:");
    console.log("1. Register User");
    console.log("2. Login User");
    console.log("3. Logout User");
    console.log("4. Add Allergy");
    console.log("5. Remove Allergy");
    console.log("6. List User Allergies");
    console.log("7. List Recipes (Filtered by Allergies)");
    console.log("8. Exit");

    rl.question("Enter your choice: ", (choice) => {
        handleMenuChoice(choice);
    });
};

const handleMenuChoice = (choice) => {
    switch (choice) {
        case '1':
            registerUserPrompt();
            break;
        case '2':
            loginUserPrompt();
            break;
        case '3':
            logoutUserPrompt();
            break;
        case '4':
            addAllergyPrompt();
            break;
        case '5':
            removeAllergyPrompt();
            break;
        case '6':
            listUserAllergiesPrompt();
            break;
        case '7':
            listRecipesPrompt();
            break;
        case '8':
            rl.close();
            console.log("Exiting program...");
            break;
        default:
            console.log("Invalid choice. Please try again.");
            showMenu();
    }
};

// Functions for each menu option
const registerUserPrompt = () => {
    rl.question("Enter username: ", (username) => {
        rl.question("Enter email: ", (email) => {
            rl.question("Enter password: ", (password) => {
                registerUser(username, email, password, (err, result) => {
                    if (err) return console.error("Error registering user:", err.message);
                    console.log("User registered with ID:", result.userId);
                    showMenu();
                });
            });
        });
    });
};

const loginUserPrompt = () => {
    rl.question("Enter email: ", (email) => {
        rl.question("Enter password: ", (password) => {
            loginUser(email, password, (err, loginResult) => {
                if (err) return console.error("Error logging in:", err.message);
                if (!loginResult) {
                    console.log("Invalid credentials");
                } else {
                    console.log("User logged in with session ID:", loginResult.sessionId);
                    currentSessionId = loginResult.sessionId;
                    currentUserId = loginResult.userId;
                }
                showMenu();
            });
        });
    });
};

const logoutUserPrompt = () => {
    if (currentSessionId) {
        logoutUser(currentSessionId, (err, result) => {
            if (err) return console.error("Error logging out:", err.message);
            console.log(result.success ? "User logged out successfully" : "Logout failed");
            currentSessionId = null;
            currentUserId = null;
            showMenu();
        });
    } else {
        console.log("No user is currently logged in.");
        showMenu();
    }
};

const addAllergyPrompt = () => {
    if (!currentUserId) {
        console.log("Please log in first.");
        showMenu();
        return;
    }

    rl.question("Enter allergy name to add: ", (allergyName) => {
        addAllergy(currentUserId, allergyName, (err) => {
            if (err) return console.error("Error adding allergy:", err.message);
            console.log("Allergy added.");
            showMenu();
        });
    });
};

const removeAllergyPrompt = () => {
    if (!currentUserId) {
        console.log("Please log in first.");
        showMenu();
        return;
    }

    rl.question("Enter allergy name to remove: ", (allergyName) => {
        removeAllergy(currentUserId, allergyName, (err, success) => {
            if (err) return console.error("Error removing allergy:", err.message);
            if (!success) console.log("Allergy not found.");
            else console.log("Allergy removed successfully.");
            showMenu();
        });
    });
};

const listUserAllergiesPrompt = () => {
    if (!currentUserId) {
        console.log("Please log in first.");
        showMenu();
        return;
    }

    listUserAllergies(currentUserId, (err, allergies) => {
        if (err) return console.error("Error listing allergies:", err.message);
        console.log("User allergies:", allergies.length ? allergies : "None");
        showMenu();
    });
};

const listRecipesPrompt = () => {
    if (!currentUserId) {
        console.log("Please log in first.");
        showMenu();
        return;
    }

    listRecipes(currentUserId, (err, recipes) => {
        if (err) return console.error("Error listing recipes:", err.message);
        console.log("Recipes compatible with user allergies:", recipes.length ? recipes : "No compatible recipes found.");
        showMenu();
    });
};

// Start the program
console.log("Welcome to the Recipe Management System!");
showMenu();