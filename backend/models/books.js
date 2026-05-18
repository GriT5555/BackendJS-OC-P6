
const mongoose = require('mongoose');

const booksSchema = mongoose.Schema({
  userId: req.body.userId,
  title: req.body.title,
  author: req.body.author,
  year: req.body.year,
  genre: req.body.genre,
  description: req.body.description,
  imageUrl: req.body.imageUrl,
  ratings: req.body.ratings,
  averageRating: req.body.averageRating
});

module.exports = mongoose.model('Books', booksSchema);