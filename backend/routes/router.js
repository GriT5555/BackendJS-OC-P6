const express = require('express');
const Book = require('../models/books');
const router = express.Router();
const booksCtrl = require('../controllers/controls');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const books = require('../models/books');

router.get('/bestrating', booksCtrl.big3);
router.post('/', auth, multer, booksCtrl.createBook);
router.post('/:id/rating', auth, multer, booksCtrl.rateBook);
router.put('/:id', auth, multer, booksCtrl.updateBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/:id', booksCtrl.oneBook);
router.get('/' +'', booksCtrl.everyBook);

module.exports = router;