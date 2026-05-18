const express = require('express');
const Book = require('../models/books');
const router = express.Router();
const booksCtrl = require('../controllers/controls');

router.post('/', booksCtrl.createBook);
router.put('/:id', booksCtrl.updateBook);
router.delete('/:id', booksCtrl.deleteBook);
router.get('/:id', booksCtrl.oneBook);
router.get('/' +'', booksCtrl.everyBook);

module.exports = router;