const books = require('../models/books');
const Book = require('../models/books');
const fs = require('fs')

/* création livre */

exports.createBook = (req, res, next) => {

  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, 
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` /* url gen */ 
});

  if(book.ratings && book.ratings.length >0) {
    const Total = book.ratings.reduce((sum, ratings) => sum + ratings.grade, 0);
    book.averageRating = Total / book.ratings.length;
  } else {
    book.averageRating = 0;
  };
  console.log("note moyenne:", book.averageRating);
  book.save()
  .then(() => { res.status(201).json({message: "Book uploaded!"})})
  .catch(error => 
    {res.status(400).json({error})})
};

/* update book */ 

exports.updateBook = (req, res, next) => {
  Book.findOne ({_id: req.params.id })
  .then((book) => {
    if(!book){
      return res.status(404).json({ message: "Book not found" })
    }
    if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: "Not allowed" });
    }

      const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
  } : { ...req.body,
    imageUrl: book.imageUrl
  };

  delete bookObject._userId
  delete bookObject._id
  Object.keys(bookObject).forEach(key=> {
    book[key] = bookObject[key];
  });

  if (book.ratings && book.ratings.length>0) {
    const Total = book.ratings.reduce((sum, ratings) => sum + ratings.grade, 0);
    book.averageRating = Total / book.ratings.length;
    console.log(book.averageRating);
  } else {
    book.averageRating = 0;
  };

  console.log("updated average rating", book.averageRating);

  return book.save();
  })
  .then(() => res.status(200).json({message: "Book updated!"}))
  .catch((error) => res.status(400).json({error}));
};

/* delete 1 book */ 

exports.deleteBook = (req, res, next) => {
  Book.deleteOne({_id: req.params.id})
  .then(() => {
      res.status(200).json({
        message: 'Book deleted!'
      });
    }
  )
  .catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

/* find 1 book's data (on item click) */ 

exports.oneBook = (req, res, next) => {
  Book.findById(req.params.id)
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

/* finds every book */

exports.everyBook = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

/* store and calcs ratings+ avg ratings */ 

exports.rateBook = (req, res, next) => {
  const rating = req.body.rating; 
  const userId = req.auth.userId;

  console.log(rating, userId);

  if (!rating && rating <= 0) {
    return res.status(400).json({ message: "Rating value missing" })
  }
  console.log(req.params.id);
  Book.findOne({ _id:req.params.id })
    .then((book) => {
      console.log("hello");
      if (!book) {
        return res.status(404).json({ message: "Book not found" })
      }
      console.log(book);
      const userRating = book.ratings.findIndex(rating => rating.userId === userId);
      console.log(userRating);
      if(userRating > -1) {
        book.ratings[userRating].grade = rating;
      } else {
        book.ratings.push({ userId, grade });
      }
      console.log(book);
      if (book.ratings && book.ratings.length > 0) {
        const Total = book.ratings.reduce((sum, ratings) => sum + ratings.grade, 0);
        book.averageRating = Total / book.ratings.length;
      } else {
        book.averageRating = 0;
      }
      console.log("save");
      return book.save();
    })
    .then((updatedBook) => {
      res.status(200).json(updatedBook);
    })
    .catch(error => res.status(400).json({error}));
}