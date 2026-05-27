const Book = require('../models/books');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new book({
    ...bookObject,
    userId: req.auth.userId, 
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` /* url gen */ 
})  
  book.save()
  .then(() => { res.status(201).json({message: "Book uploaded!"})})
  .catch(error => { res.status(400).json({error})})
/*  delete req.body._id;
  const book = new book({
    ...req.body
  });
  book.save()
    .then(() => res.status(200).json({ message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json({ error })); */
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