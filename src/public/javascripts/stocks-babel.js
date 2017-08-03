var socket = io()
var ALPHA_VANTAGE_KEY

class DisplayStocks extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      stocks: [],
      symbols: [],
      stockTableColumns: 4
    }
    this.input = this.input.bind(this)
    this.clickSearch = this.clickSearch.bind(this)
    this.requestDelete = this.requestDelete.bind(this)
  }
  componentWillMount() {
    socket.on('key', (msg) => {
      ALPHA_VANTAGE_KEY = msg
    })
    socket.emit('keyRequest')
    socket.on('add', (msg) => {
      this.addOrReplaceStock(msg.stock, msg.symbol)
    })
    socket.on('delete', (msg) => {
      this.deleteStock(msg.stockPosition)
    })
    this.getStocks()
  }
  getStocks() {
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + '/api/stocks', (data) => {
      var parsedData = JSON.parse(data)
      if (parsedData.length > 0) {
        var stocks = []
        var symbols = []
        parsedData.map(function(stock) {
          stocks.push(JSON.parse(stock.data))
          symbols.push(stock.symbol)
        })
        chart(stocks)
        this.setState({
          stocks: stocks,
          symbols: symbols
        })
      }
    }))
  }
  displayMessage(message) {
    $('#message')[0].textContent = message
    $('#message').css('visibility', 'visible')
    $('#message').fadeOut(3000, function() {//function actions performed AFTER fadeOut
      $('#message').css('display', '')
      $('#message').css('visibility', 'hidden')
    })
  }
  requestStock() {
    var symbol = $('#stockSearchBox')[0].value.toUpperCase()
    $('#stockSearchBox')[0].value = ''
    var symbols = this.state.symbols
    if (!symbol) {
      this.displayMessage('Stock field empty!')
    } else {
      var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + symbol + '&apikey=' + ALPHA_VANTAGE_KEY
      ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', url, (data) => {
        var parsedData = JSON.parse(data)
        if (parsedData['Error Message']) {
          this.displayMessage('Stock symbol invalid!')
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
            data: {stockdata: JSON.stringify(parsedData)},
            success: function(info) {
              var stk
              var sym
              if (info.value) {
                stk = JSON.parse(info.value.data)
                sym = info.value.symbol
              } else {
                stk = JSON.parse(info.data)
                sym = info.symbol
              }
              socket.emit('add', {stock: stk, symbol: sym})
              setStock(stk, sym)
            }
          })
        }
      }))
    }
    var setStock = (stk, sym) => {
      this.addOrReplaceStock(stk, sym)
    }
  }
  addOrReplaceStock(stock, symbol) {
    var symbols = this.state.symbols
    var stocks = this.state.stocks
    if (symbols.indexOf(symbol) != -1) {//'includes' method doesn't work in Chrome unless version is 47 or more, used 'indexOf' instead
      var stockPosition = symbols.indexOf(symbol)
      stocks.splice(stockPosition, 1)
      stocks.splice(stockPosition, 0, stock)
      this.displayMessage(symbol + ' updated!')
    } else {
      stocks.push(stock)
      symbols.push(symbol)
    }
    chart(stocks)
    this.setState({
      stocks: stocks,
      symbols: symbols
    })
  }
  input(e) {
    if (e.which == 13) {
      this.requestStock()
    }
  }
  clickSearch() {
    this.requestStock()
  }
  requestDelete(e) {
    var stockPosition = e.target.id.split('_')[1]
    var symbols = this.state.symbols
    var symbol = symbols[stockPosition]
    ajaxFunctions.ready(ajaxFunctions.ajaxDeleteRequest('DELETE', appUrl + '/api/stocks', symbol, (data) => {
      socket.emit('delete', {stockPosition: stockPosition})
      this.deleteStock(stockPosition)
    }))
  }
  deleteStock(stockPosition) {
    var stocks = this.state.stocks
    stocks.splice(stockPosition, 1)
    chart(stocks)
    var symbols = this.state.symbols
    symbols.splice(stockPosition, 1)
    this.setState({
      stocks: stocks,
      symbols: symbols
    })
  }
  render() {
    return (
      <div id='frame'>
        <div id='page'>
          <h2>Stock Charter</h2>
          <input id='stockSearchBox' type='text' placeholder='Enter stock symbol' onKeyDown={this.input}/>
          <button onClick={this.clickSearch}>Add/update stock</button>
          <div id={`message`} style={{visibility: 'hidden'}}>filler</div>
          <table>
            <StockRows stocks={this.state.stocks} stockTableColumns={this.state.stockTableColumns} requestDelete={this.requestDelete}/>
          </table>
          <div id='chart'></div>
        </div>
      </div>
    )
  }
}

var StockRows = function(props) {
  var totalStocks = props.stocks.length
  var stocks = []
  var stockRow = []
  for (let i = 0; i < totalStocks; i++) {
    stockRow.push(props.stocks[i])
    if (stockRow.length == props.stockTableColumns || i == totalStocks - 1) {
      stocks.push(stockRow)
      stockRow = []
    }
  }
  var stockRows = stocks.map(function(row, i) {
    return <Stocks key={i} rowNumber={i} row={row} stockTableColumns={props.stockTableColumns} requestDelete={props.requestDelete}/>
  })
  return (
      <tbody>
        {stockRows}
      </tbody>
  )
}

var Stocks = function(props) {
  var stocks = props.row.map(function(stock, i) {
    return <td key={props.rowNumber + '_' + i}><div className='cell'>{stock['Meta Data']['2. Symbol']}</div><i id={'delete_' + (props.rowNumber * props.stockTableColumns + i)} className='fa fa-close' onClick={props.requestDelete}></i></td>
  })
  return <tr>{stocks}</tr>
}

ReactDOM.render(<DisplayStocks />, document.getElementById('target'))
