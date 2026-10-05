const express = require("express");

const app = express();
const PORT = 3000;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

// Logger Middleware
function logger(req, res, next) {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
}

// Request Timing Middleware
function timer(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Request completed in ${duration} ms`
        );
    });

    next();
}

// Route-specific Middleware
function checkApiKey(req, res, next) {
    if (req.headers["x-api-key"] === "12345") {
        next();
    } else {
        res.status(401).send("Unauthorized: Invalid API Key");
    }
}

// Apply middleware globally
app.use(logger);
app.use(timer);

// JSON body parser
app.use(express.json());

// --------------------------------------------------
// PART (a) - ROUTES, PARAMETERS & URL
// --------------------------------------------------

// Basic Route
app.get("/", (req, res) => {
    res.send("Welcome to ExpressJS Routing Demo!");
});

// Route Parameter
app.get("/user/:id", (req, res) => {
    const id = req.params.id;

    res.send(`User ID: ${id}`);
});

// Query Parameters
app.get("/search", (req, res) => {
    const query = req.query.q || "";
    const limit = req.query.limit || "10";

    res.send(`Searching for '${query}', limit ${limit}`);
});

// URL using req.originalUrl
app.get("/url", (req, res) => {
    res.json({
        message: "Current URL",
        originalUrl: req.originalUrl
    });
});

// Redirect example
app.get("/home", (req, res) => {
    res.redirect("/");
});

// --------------------------------------------------
// PART (b) - BOOK RESOURCE
// --------------------------------------------------

let books = [
    {
        id: 1,
        title: "The Hobbit",
        author: "Tolkien"
    },
    {
        id: 2,
        title: "Dune",
        author: "Herbert"
    }
];

let nextId = 3;

// GET /books - Get all books
app.get("/books", (req, res) => {
    res.json(books);
});

// GET /books/:id - Get specific book
app.get("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).send("Book Not Found");
    }

    res.json(book);
});

// POST /books - Add new book
app.post("/books", (req, res) => {
    const { title, author } = req.body;

    // Validate input
    if (!title || !author) {
        return res.status(400).json({
            error: "Title and author are required"
        });
    }

    const newBook = {
        id: nextId++,
        title: title,
        author: author
    };

    books.push(newBook);

    res.status(201).json(newBook);
});

// DELETE /books/:id - Delete book
app.delete("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).send("Book Not Found");
    }

    books.splice(index, 1);

    res.status(204).send();
});

// --------------------------------------------------
// ROUTE-SPECIFIC MIDDLEWARE DEMO
// --------------------------------------------------

app.get("/secure/books", checkApiKey, (req, res) => {
    res.json({
        message: "You are authorized",
        books: books
    });
});

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
    res.status(404).send("Route Not Found");
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});