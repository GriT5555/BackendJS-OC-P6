const books = require('../models/books');
const Book = require('../models/books');
const path = require('path');
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

  if (book.ratings && book.ratings.length > 0) {
    const Total = book.ratings.reduce((sum, ratings) => sum + ratings.grade, 0);
    book.averageRating = Total / book.ratings.length;
  } else {
    book.averageRating = 0;
  };
  book.save()
    .then(() => { res.status(201).json({ message: "Book uploaded!" }) })
    .catch(error => { res.status(400).json({ error }) })
};

/* update book */

exports.updateBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: "Not allowed" });
      }

      if (req.file) {
        const previousImage = book.imageUrl.split('/images/')[1];
        if (previousImage) {
          const previousPath = path.join(__dirname, '..', 'images', previousImage); // on vérifie que si une nouvelle image est uploadée, l'ancienne existe

          fs.unlink(previousPath, (err) => {
            if (err) {
              console.warn('Could not delete old image or did not find it:', err);
            } else {
              console.log(`previous image replaced: ${previousImage}`);
            }
          });
        }

        const bookObject = JSON.parse(req.body.book);
        bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        
        Object.keys(bookObject).forEach(key => {
          book[key] = bookObject[key];
        });
      } else { /* pas de nouvelles images */
        const bookObject = req.body.book ? JSON.parse(req.body.book) : { ...req.body };
        
        delete bookObject.imageUrl; 
        
        Object.keys(bookObject).forEach(key => {
          book[key] = bookObject[key];
        });
      }

      delete book._userId;
      delete book._id;

      if (book.ratings && book.ratings.length > 0) {
        const Total = book.ratings.reduce((sum, ratings) => sum + ratings.grade, 0);
        book.averageRating = Total / book.ratings.length;
      } else {
        book.averageRating = 0;
      }

      return book.save();
    })
    .then(() => {
      res.status(200).json({ message: "Book updated!" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/* delete 1 book */

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log('Missing file, ok!');
          resolve();
        } else {
          reject(err);
        }
      } else {
        console.log(`File deleted: ${filePath}`);
        resolve();
      }
    });
  });
}; // helper funct

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const filename = book.imageUrl.split('/images/')[1];
      const filePath = path.join(__dirname, '..', 'images', filename);

      return deleteFile(filePath)
        .then(() => {
          return Book.deleteOne({ _id: req.params.id });
        });
    })
    .then(() => {
      res.status(200).json({ message: 'Book and linked image deleted!' });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(400).json({ error: error.message });
    });
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
  const grade = req.body.rating;
  const userId = req.auth.userId;

  if (grade === undefined || grade === null) {
    return res.status(400).json({
      message: "Rating value missing. Sent body: " + JSON.stringify(req.body)
    });
  }
  if (!grade && grade <= 0) {
    return res.status(400).json({ message: "Rating value missing" })
  }
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" })
      }
      const userRating = book.ratings.findIndex(rating => rating.userId === userId);
      if (userRating > -1) {
        book.ratings[userRating].grade = grade;
      } else {
        book.ratings.push({ userId, grade });
      }
      if (book.ratings && book.ratings.length > 0) {
        const Total = book.ratings.reduce((sum, ratings) => sum + ratings.grade, 0);
        book.averageRating = Total / book.ratings.length;
      } else {
        book.averageRating = 0;
      }
      return book.save();
    })
    .then((updatedBook) => {
      res.status(200).json(updatedBook);
    })
    .catch(error => res.status(400).json({ error }));
}

/* sort in declining order, then pick up the first three items (3 best ratings) */

exports.big3 = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      const targetedBooks = books.map(book => {
        const big3Object = book.toObject();
        big3Object.id = big3Object._id;
        return big3Object;
      });
      res.status(200).json(targetedBooks);
    })
    .catch((error) => {
      console.error("Error fetching best rated books", error);
      res.status(403).json({ error });
    })
}