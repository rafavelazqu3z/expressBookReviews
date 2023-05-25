const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ 
    username: 'nahuel', password: '123',
    username: 'rafael',password: 'rafael12'
 }];
// Función para verificar si el nombre de usuario es válido
const isValid = (username) => {
    // Verificar si el nombre de usuario existe en el arreglo de usuarios
    const user = users.find(user => user.username === username);
    return !!user; // Devuelve true si el usuario existe, de lo contrario, false
  };
  
  // Función para verificar si el usuario está autenticado
  const authenticatedUser = (username, password) => {
    // Verificar si el usuario existe y la contraseña coincide
    const user = users.find(user => user.username === username && user.password === password);
    return !!user; // Devuelve true si el usuario está autenticado, de lo contrario, false
  };

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
  
    req.session.authorization = {
      accessToken,
      username
    };
  
    const token = jwt.sign({ username }, 'your-secret-key');
    res.status(200).json({ token });
  });
  
  regd_users.put("/auth/review/:isbn", (req, res) => {
      const isbn = req.params.isbn;
      let filtered_book = books[isbn];
    
      if (filtered_book) {
        let review = req.query.review;
    
        // Verificar si el usuario ha iniciado sesión
        if (!req.session.authorization || !req.session.authorization.username) {
          return res.status(401).json({ message: "User not logged in" });
        }
    
        let username = req.session.authorization;
    
        if (review) {
          filtered_book.reviews[username] = review;
          books[isbn] = filtered_book;
        }
    
        res.send(`The review for the book with ISBN ${isbn} has been added/updated.`);
      } else {
        res.send("Unable to find this ISBN!");
      }
    });

    regd_users.delete("/auth/review/:isbn", (req, res) => {
        const isbn = req.params.isbn;
        let filtered_book = books[isbn];

  if (filtered_book) {
    let reviewer = req.session?.authorization?.username;

    if (!reviewer) {
      return res.status(401).send("User not logged in.");
    }

    if (filtered_book.reviews.hasOwnProperty(reviewer)) {
      delete filtered_book.reviews[reviewer];
      books[isbn] = filtered_book;
      return res.send(`The review for the book with ISBN ${isbn} has been deleted.`);
    } else {
      return res.send(`Review of ${reviewer} not found for the provided ISBN.`);
    }
  } else {
    return res.send("Unable to find this ISBN!");
  }
    });
  
  module.exports = {
    authenticated: regd_users,
    isValid: isValid,
    users: users
  };