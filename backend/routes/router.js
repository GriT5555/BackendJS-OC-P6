const express = require('express');
const Book = require('../models/books');
const router = express.Router();
const booksCtrl = require('../controllers/controls');
const auth = require('../middleware/auth');

router.post('/', auth, booksCtrl.createBook);
router.put('/:id', auth, booksCtrl.updateBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/:id', auth, booksCtrl.oneBook);
router.get('/' +'', auth, booksCtrl.everyBook);

module.exports = router;