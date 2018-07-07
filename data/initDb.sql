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
    dishId TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    sizes TEXT,
    category TEXT,
    image TEXT DEFAULT "noimg.jpg",
    multiOptions TEXT,
    singleOptions TEXT
);

-- Orders database
CREATE TABLE orders (
    orderId TEXT UNIQUE NOT NULL,
    dishes TEXT NOT NULL,
    notes TEXT,
    timeSubmitted DATETIME NOT NULL,
    timeCompleted DATETIME,
    timePaid DATETIME,
    orderComplete BOOLEAN NOT NULL,
    serverId TEXT NOT NULL,
    tableNumber INT NOT NULL,
    amtPaid REAL
);
