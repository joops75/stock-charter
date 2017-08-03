'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var socket = io();
var ALPHA_VANTAGE_KEY;

var DisplayStocks = function (_React$Component) {
  _inherits(DisplayStocks, _React$Component);

  function DisplayStocks(props) {
    _classCallCheck(this, DisplayStocks);

    var _this = _possibleConstructorReturn(this, (DisplayStocks.__proto__ || Object.getPrototypeOf(DisplayStocks)).call(this, props));

    _this.state = {
      stocks: [],
      symbols: [],
      stockTableColumns: 4
    };
    _this.input = _this.input.bind(_this);
    _this.clickSearch = _this.clickSearch.bind(_this);
    _this.requestDelete = _this.requestDelete.bind(_this);
    return _this;
  }

  _createClass(DisplayStocks, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      socket.on('key', function (msg) {
        ALPHA_VANTAGE_KEY = msg;
      });
      socket.emit('keyRequest');
      socket.on('add', function (msg) {
        _this2.addOrReplaceStock(msg.stock, msg.symbol);
      });
      socket.on('delete', function (msg) {
        _this2.deleteStock(msg.stockPosition);
      });
      this.getStocks();
    }
  }, {
    key: 'getStocks',
    value: function getStocks() {
      var _this3 = this;

      ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + '/api/stocks', function (data) {
        var parsedData = JSON.parse(data);
        if (parsedData.length > 0) {
          var stocks = [];
          var symbols = [];
          parsedData.map(function (stock) {
            stocks.push(JSON.parse(stock.data));
            symbols.push(stock.symbol);
          });
          chart(stocks);
          _this3.setState({
            stocks: stocks,
            symbols: symbols
          });
        }
      }));
    }
  }, {
    key: 'displayMessage',
    value: function displayMessage(message) {
      $('#message')[0].textContent = message;
      $('#message').css('visibility', 'visible');
      $('#message').fadeOut(3000, function () {
        //function actions performed AFTER fadeOut
        $('#message').css('display', '');
        $('#message').css('visibility', 'hidden');
      });
    }
  }, {
    key: 'requestStock',
    value: function requestStock() {
      var _this4 = this;

      var symbol = $('#stockSearchBox')[0].value.toUpperCase();
      $('#stockSearchBox')[0].value = '';
      var symbols = this.state.symbols;
      if (!symbol) {
        this.displayMessage('Stock field empty!');
      } else {
        var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + symbol + '&apikey=' + ALPHA_VANTAGE_KEY;
        ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', url, function (data) {
          var parsedData = JSON.parse(data);
          if (parsedData['Error Message']) {
            _this4.displayMessage('Stock symbol invalid!');
          } else {
            // following ajax method doesn't work on Heroku (data too large for request header, error code 400)
            // ajaxFunctions.ready(ajaxFunctions.ajaxSaveRequest('POST', appUrl + '/api/stocks', JSON.stringify(parsedData), (info) => {
            //   var parsedInfo = JSON.parse(info)
            //   var stk
            //   var sym
            //   if (parsedInfo.value) {
            //     stk = JSON.parse(parsedInfo.value.data)
            //     sym = parsedInfo.value.symbol
            //   } else {
            //     stk = JSON.parse(parsedInfo.data)
            //     sym = parsedInfo.symbol
            //   }
            //   socket.emit('add', {stock: stk, symbol: sym})
            //   setStock(stk, sym)
            // }))
            $.ajax({
              url: '/api/stocks',
              type: 'POST',
              dataType: 'JSON',
              data: { stockdata: JSON.stringify(parsedData) },
              success: function success(info) {
                var stk;
                var sym;
                if (info.value) {
                  stk = JSON.parse(info.value.data);
                  sym = info.value.symbol;
                } else {
                  stk = JSON.parse(info.data);
                  sym = info.symbol;
                }
                socket.emit('add', { stock: stk, symbol: sym });
                setStock(stk, sym);
              }
            });
          }
        }));
      }
      var setStock = function setStock(stk, sym) {
        _this4.addOrReplaceStock(stk, sym);
      };
    }
  }, {
    key: 'addOrReplaceStock',
    value: function addOrReplaceStock(stock, symbol) {
      var symbols = this.state.symbols;
      var stocks = this.state.stocks;
      if (symbols.indexOf(symbol) != -1) {
        //'includes' method doesn't work in Chrome unless version is 47 or more, used 'indexOf' instead
        var stockPosition = symbols.indexOf(symbol);
        stocks.splice(stockPosition, 1);
        stocks.splice(stockPosition, 0, stock);
        this.displayMessage(symbol + ' updated!');
      } else {
        stocks.push(stock);
        symbols.push(symbol);
      }
      chart(stocks);
      this.setState({
        stocks: stocks,
        symbols: symbols
      });
    }
  }, {
    key: 'input',
    value: function input(e) {
      if (e.which == 13) {
        this.requestStock();
      }
    }
  }, {
    key: 'clickSearch',
    value: function clickSearch() {
      this.requestStock();
    }
  }, {
    key: 'requestDelete',
    value: function requestDelete(e) {
      var _this5 = this;

      var stockPosition = e.target.id.split('_')[1];
      var symbols = this.state.symbols;
      var symbol = symbols[stockPosition];
      ajaxFunctions.ready(ajaxFunctions.ajaxDeleteRequest('DELETE', appUrl + '/api/stocks', symbol, function (data) {
        socket.emit('delete', { stockPosition: stockPosition });
        _this5.deleteStock(stockPosition);
      }));
    }
  }, {
    key: 'deleteStock',
    value: function deleteStock(stockPosition) {
      var stocks = this.state.stocks;
      stocks.splice(stockPosition, 1);
      chart(stocks);
      var symbols = this.state.symbols;
      symbols.splice(stockPosition, 1);
      this.setState({
        stocks: stocks,
        symbols: symbols
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { id: 'frame' },
        React.createElement(
          'div',
          { id: 'page' },
          React.createElement(
            'h2',
            null,
            'Stock Charter'
          ),
          React.createElement('input', { id: 'stockSearchBox', type: 'text', placeholder: 'Enter stock symbol', onKeyDown: this.input }),
          React.createElement(
            'button',
            { onClick: this.clickSearch },
            'Add/update stock'
          ),
          React.createElement(
            'div',
            { id: 'message', style: { visibility: 'hidden' } },
            'filler'
          ),
          React.createElement(
            'table',
            null,
            React.createElement(StockRows, { stocks: this.state.stocks, stockTableColumns: this.state.stockTableColumns, requestDelete: this.requestDelete })
          ),
          React.createElement('div', { id: 'chart' })
        )
      );
    }
  }]);

  return DisplayStocks;
}(React.Component);

var StockRows = function StockRows(props) {
  var totalStocks = props.stocks.length;
  var stocks = [];
  var stockRow = [];
  for (var i = 0; i < totalStocks; i++) {
    stockRow.push(props.stocks[i]);
    if (stockRow.length == props.stockTableColumns || i == totalStocks - 1) {
      stocks.push(stockRow);
      stockRow = [];
    }
  }
  var stockRows = stocks.map(function (row, i) {
    return React.createElement(Stocks, { key: i, rowNumber: i, row: row, stockTableColumns: props.stockTableColumns, requestDelete: props.requestDelete });
  });
  return React.createElement(
    'tbody',
    null,
    stockRows
  );
};

var Stocks = function Stocks(props) {
  var stocks = props.row.map(function (stock, i) {
    return React.createElement(
      'td',
      { key: props.rowNumber + '_' + i },
      React.createElement(
        'div',
        { className: 'cell' },
        stock['Meta Data']['2. Symbol']
      ),
      React.createElement('i', { id: 'delete_' + (props.rowNumber * props.stockTableColumns + i), className: 'fa fa-close', onClick: props.requestDelete })
    );
  });
  return React.createElement(
    'tr',
    null,
    stocks
  );
};

ReactDOM.render(React.createElement(DisplayStocks, null), document.getElementById('target'));
//# sourceMappingURL=stocks-babel.js.map
