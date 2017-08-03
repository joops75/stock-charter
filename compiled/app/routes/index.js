'use strict';

var path = require('path');
var directory = __dirname;
var folder;
if (directory.split('\\').length > 1) {
  //indicates address is split by back slashes (windows environment)
  var arr = directory.split('\\');
  folder = arr[arr.length - 3];
} else {
  //indicates address is split by forward slashes (linux environment)
  var arr = directory.split('/');
  folder = arr[arr.length - 3];
}

var StocksHandler = require(path.join(process.cwd() + '/' + folder + "/app/controllers/stocksHandler.server.js"));

module.exports = function (app, db) {
  var stocksHandler = new StocksHandler(db);
  app.route('/').get(function (req, res) {
    res.sendFile(path.join(process.cwd() + '/' + folder + '/public/stocks.html'));
  });
  app.route('/api/stocks').get(stocksHandler.getStocks).post(stocksHandler.saveStock).delete(stocksHandler.deleteStock);
};
//# sourceMappingURL=index.js.map
