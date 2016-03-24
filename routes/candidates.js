var express = require('express');
var router = express.Router();
var candidates = require('../models/candidate');

/* GET users listing. */
//router.get('/', function (req, res) {
//    res.send('respond with a resource');
//});

router.get('/', candidates.getAll);

router.post('/add', candidates.add);

router.post('/remove', candidates.remove);

module.exports = router;