const Book = require('../models/books');

exports.createBook = (req, res, next) => {
  delete req.body._id;
  const book = new book({
    ...req.body
  });
  book.save()
    .then(() => res.status(200).json({ message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.updateBook = (req, res, next) => {
  Book.updateOne(
    {_id: req.params.id},
    { $set: req.body }
  )
    .then(() => {
      res.status(201).json({
        message: 'Book updated successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({        
        error: error
      });
    }
  );
};

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

exports.oneBook = (req, res, next) => {
  Book.findById(req.params.id)
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

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