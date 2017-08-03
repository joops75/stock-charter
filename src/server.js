'use strict'

var express = require("express"),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  routes = require("./app/routes/index.js"),
  mongo = require("mongodb").MongoClient(),
  path = require('path'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000
require("dotenv").load()

io.on('connection', function(socket){
  socket.on('keyRequest', function(){
    socket.emit('key', process.env.ALPHA_VANTAGE_KEY)//socket.emit just sends info to own socket
  })
  socket.on('add', function(msg){
    socket.broadcast.emit('add', msg)//broadcast to everyone but here (io.emit and io.sockets.emit sends to everyone including here)
  })
  socket.on('delete', function(msg){
    socket.broadcast.emit('delete', msg)
  })
})

mongo.connect(process.env.MONGO_URI, function(err, db) {
  if (err) {
    throw new Error('database failed to connect')
  }
  app.use('/public', express.static(path.join(__dirname + '/public')))
  app.use('/common', express.static(path.join(__dirname + '/app/common')))
  app.use('/controllers', express.static(path.join(__dirname + '/app/controllers')))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  routes(app, db)

  http.listen(port)
})
