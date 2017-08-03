var chart = function(stocksData) {
  d3.select('#chart').selectAll('svg').remove()

  if (stocksData.length > 0) {
    var margin = {top: 40, right: 60, bottom: 50, left: 60}
    var w = 950
    var h = 500
    var width = w - margin.left - margin.right
    var height = h - margin.top - margin.bottom

    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    var parseTime = d3.utcParse("%Y-%m-%d")

    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10)

    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) {return x(d.date)})
        .y(function(d) {return y(d.price)})

    var stocks = stocksData.map(function(stock) {//returns an array of objects
      return {
        symbol: stock['Meta Data']['2. Symbol'],
        values: Object.keys(stock['Time Series (Daily)']).map(function(d) {
          return {date: parseTime(d.split(' ')[0]), price: parseFloat(stock['Time Series (Daily)'][d]['4. close'])}
       })
     }
   })

    x.domain([
      d3.min(stocks, function(s) {return d3.min(s.values, function(d) {return d.date})}),
      d3.max(stocks, function(s) {return d3.max(s.values, function(d) {return d.date})})
    ])

    y.domain([
      d3.min(stocks, function(s) {return d3.min(s.values, function(d) {return d.price})}),
      d3.max(stocks, function(s) {return d3.max(s.values, function(d) {return d.price})})
    ])

    z.domain(stocks.map(function(s) {return s.symbol}))

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Stock Price, $")

    var stockLine = g.selectAll(".stockLine")
      .data(stocks)
      .enter().append("g")
        .attr("class", "stockLine")

    stockLine.append("path")
        .attr("class", "line")
        .attr("d", function(d) {return line(d.values)})
        .style("stroke", function(d) {return z(d.symbol)})

    stockLine.append("text")
        .datum(function(d) {return {symbol: d.symbol, value: d.values[0]}})
        .attr("class", "label")
        .attr("transform", function(d) {return "translate(" + x(d.value.date) + "," + y(d.value.price) + ")"})
        .attr("x", 3)
        .attr("dy", "0.35em")
        .text(function(d) {return d.symbol})
 }
}
