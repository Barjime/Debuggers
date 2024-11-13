-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS allergies;
DROP TABLE IF EXISTS user_allergies;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS food_allergies;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS recipe_ingredients;

-- Create users table
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT,
    password TEXT
);

-- Create allergies table
CREATE TABLE allergies (
    allergy_id TEXT PRIMARY KEY,
    allergy_name TEXT UNIQUE NOT NULL
);

-- Create user_allergies table
CREATE TABLE user_allergies (
    user_allergy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    allergy_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (allergy_id) REFERENCES allergies (allergy_id)
);

-- Create foods table
CREATE TABLE foods (
    food_id INTEGER PRIMARY KEY,
    food_name TEXT UNIQUE NOT NULL
);

-- Create food_allergies table
CREATE TABLE food_allergies (
    food_allergy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER,
    allergy_id TEXT,
    FOREIGN KEY (food_id) REFERENCES foods (food_id),
    FOREIGN KEY (allergy_id) REFERENCES allergies (allergy_id)
);

-- Create recipes table
CREATE TABLE recipes (
    recipe_id INTEGER PRIMARY KEY,
    recipe_name TEXT NOT NULL,
    instructions TEXT
);

-- Create recipe_ingredients table
CREATE TABLE recipe_ingredients (
    recipe_ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER,
    food_id INTEGER,
    FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id),
    FOREIGN KEY (food_id) REFERENCES foods (food_id)
);

-- Populate allergies and restrictions with filtering options
INSERT INTO allergies (allergy_id, allergy_name) VALUES 
    ('1', "Peanut Allergy"),
    ('2', "Dairy Allergy"),
    ('3', "Gluten Allergy"),
    ('01', "Vegan"),
    ('02', "Vegetarian");

-- Populate foods
INSERT INTO foods (food_id, food_name) VALUES 
    (11, "Peanuts"),
    (12, "Milk"),
    (13, "Wheat"),
    (14, "Tofu"),       -- Vegan and vegetarian-friendly
    (15, "Lettuce"),    -- Safe for all restrictions
    (16, "Eggs"),       -- Non-vegan but vegetarian
    (17, "Almond Milk"),-- Vegan and vegetarian-friendly
    (18, "Cheese");     -- Contains dairy

-- Map foods to allergies/restrictions in food_allergies
-- Associating relevant foods with appropriate allergies or restrictions
INSERT INTO food_allergies (food_id, allergy_id) VALUES 
    (11, '1'),  -- Peanuts -> Peanut Allergy
    (12, '2'),  -- Milk -> Dairy Allergy
    (13, '3'),  -- Wheat -> Gluten Allergy
    (12, '02'), -- Milk is also non-vegan
    (16, '02'), -- Eggs are vegetarian but not vegan
    (18, '2');  -- Cheese contains dairy

-- Populate recipes with a mix of restrictions
INSERT INTO recipes (recipe_id, recipe_name, instructions) VALUES 
    (1, "Peanut Butter Sandwich", "Spread peanut butter on bread and enjoy."),
    (2, "Tofu Salad", "Mix tofu, lettuce, and almond milk for a vegan-friendly salad."),
    (3, "Egg Salad", "Mix eggs and lettuce with seasoning for a simple dish."),
    (4, "Grilled Cheese Sandwich", "Grill cheese between slices of bread."),
    (5, "Almond Milk Smoothie", "Blend almond milk and tofu for a vegan-friendly smoothie.");

-- Map ingredients to recipes in recipe_ingredients
INSERT INTO recipe_ingredients (recipe_id, food_id) VALUES 
    (1, 11),        -- Peanut Butter Sandwich -> Peanuts
    (2, 14),        -- Tofu Salad -> Tofu
    (2, 15),        -- Tofu Salad -> Lettuce
    (2, 17),        -- Tofu Salad -> Almond Milk
    (3, 16),        -- Egg Salad -> Eggs
    (3, 15),        -- Egg Salad -> Lettuce
    (4, 18),        -- Grilled Cheese Sandwich -> Cheese
    (4, 13),        -- Grilled Cheese Sandwich -> Wheat
    (5, 17),        -- Almond Milk Smoothie -> Almond Milk
    (5, 14);        -- Almond Milk Smoothie -> Tofu