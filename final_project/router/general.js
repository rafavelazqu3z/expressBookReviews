const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const apiEndPoint = 'https://rafaelvelaz1-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai'

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }


public_users.post("/register", (req,res) => {
    const {username, password} = req.body;
    let users = [
        {username : "rafael", password: "rafael12"},
        {username : "nahuel", password: "nahuel12"},
    ];

    if (!username || !password){
        return res.status(400).send("Username and password are required.");
    }
    const existingUser = users.find((user) => user.username === username);
    if(existingUser){
        return res.status(409).send("Username already exists.")
    }

    res.status(200).send("Registration succesful.")
  });

  public_users.get('/books',function (req, res) {
    res.send(JSON.stringify(books,null,4))
   });

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    axios.get(apiEndPoint+'/books')
      .then(response => {
        res.send(JSON.stringify(response.data, null, 4));
      })
      .catch(error => {
        res.status(500).send('Error retrieving books: ' + error.message);
      });
  });

  public_users.get('/isbn/:isbn',function (req, res) {
    res.send(JSON.stringify(books[req.params.isbn],null,4))
   });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    axios.get(apiEndPoint+'/isbn/'+ req.params.isbn)
      .then(response => {
        res.send(JSON.stringify(response.data, null, 4));
      })
      .catch(error => {
        res.status(500).send('Error retrieving book: ' + error.message);
      });
  });
  

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    axios.get(apiEndPoint)
      .then(response => {
        const author = req.params.author;
  
        const booksKeys = Object.keys(response.data);
  
        const matchingBooks = [];
        for (const key of booksKeys){
            const book = response.data[key];
  
            if (book.author === author){
                matchingBooks.push(book);
            }
        }
  
        res.send(matchingBooks);
      })
      .catch(error => {
        res.status(500).send('Error retrieving books: ' + error.message);
      });
  });


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    axios.get(apiEndPoint)
      .then(response => {
        const title = req.params.title;
        const booksKeys = Object.keys(response.data);
        const matchingBooks = [];
  
        for (const key of booksKeys){
            const book = response.data[key];
  
            if (book.title === title){
                matchingBooks.push(book);
            }
        }
  
        res.send(matchingBooks);
      })
      .catch(error => {
        res.status(500).send('Error retrieving books: ' + error.message);
      });
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books.hasOwnProperty(isbn)){
      const book = books[isbn];
      const reviews = book.reviews;

      res.send(reviews);
  }else{
      res.send("Book not found");
  }

  return res.status(200).json({message: "Paso"});
});

module.exports.general = public_users;
