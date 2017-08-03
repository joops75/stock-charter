'use strict';

function stocksHandler(db) {
  var stocks = db.collection('stocks');

  this.getStocks = function (req, res) {
    var stockProjection = { "_id": false };
    stocks.find({}, stockProjection).toArray(function (err, documents) {
      if (err) throw err;
      res.json(documents);
    });
  };
  this.saveStock = function (req, res) {
    var stock = req.body.stockdata;
    var parsedStock = JSON.parse(stock);
    var symbol = parsedStock['Meta Data']['2. Symbol'];
    var stockProjection = { "_id": false };
    stocks.findOneAndReplace({ symbol: symbol }, { data: stock, symbol: symbol }, { projection: stockProjection, upsert: true, returnNewDocument: true }, function (err) {
      //upsert: true inserts new doc if doc not found
      if (err) throw err;
      stocks.findOne({ symbol: symbol }, stockProjection, function (err, doc) {
        if (err) throw err;
        res.json(doc);
      });
    });
  };
  this.deleteStock = function (req, res) {
    var symbol = req.headers.symboldata;
    stocks.remove({ symbol: symbol }, function (err) {
      if (err) throw err;
      res.end('deleted'); //must respond with *something* so ajax callback is triggered which emits socket event
    });
    // db.close()//keep db open
  };
}

module.exports = stocksHandler;
//# sourceMappingURL=stocksHandler.server.js.map
