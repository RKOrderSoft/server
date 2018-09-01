-- Users database
CREATE TABLE users (
    userId TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT UNIQUE NOT NULL,
    accessLevel INT NOT NULL,
    dateAdded DATETIME NOT NULL
);

-- Session store
CREATE TABLE sessions (
    sessionId TEXT UNIQUE NOT NULL,
    ip TEXT NOT NULL,
    userId TEXT NOT NULL,
    expiryDate DATETIME NOT NULL
);

-- Dishes database
CREATE TABLE dishes (
    dishId INT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    basePrice REAL NOT NULL,
    upgradePrice REAL,
    sizes TEXT,
    category TEXT,
    image TEXT DEFAULT "noimg.jpg",
    description TEXT,
);

-- Orders database
CREATE TABLE orders (
    orderId TEXT UNIQUE NOT NULL,
    dishes TEXT NOT NULL,
    notes TEXT,
    timeSubmitted DATETIME NOT NULL,
    timeCompleted DATETIME,
    timePaid DATETIME,
    serverId TEXT NOT NULL,
    tableNumber INT NOT NULL,
    amtPaid REAL
);
