# Stock Charter
An app where users can add stocks to a common chart to view their price changes over recent months.

This app is built upon the code at http://www.clementinejs.com/tutorials/tutorial-beginner.html.

When the screen first loads, the current stock data stored in the connected database is rendered to the 
screen using react.js and d3.js.

If a user enters a stock, the api provided at https://www.alphavantage.co/ is called to get its price data. 
When the data is returned, the database is updated with this information and rendered to the user's screen. 
Additionally, socket.io is used at this point to trigger a re-rendering of all the other connected 
users' screens. Consequently at any given moment, all users are seeing the same chart.

Users may also delete any of the displayed stocks, or re-enter an existing stock to update it, and all 
screens will be updated simultaneously. Only the user that initiated an add, update or delete request 
makes changes to the database.

In development mode, files are served via the '/src' directory which uses the in-browser babel transformer 
to compile jsx and es6 code. A production build is made by running 'npm run compile', which uses the 
babel-compile package and stores files in '/compiled'. The in-browser babel transformer cdn can then be 
removed from '/compiled/public/stocks.html and the body's script tag type changed from 'text/babel' to 
'text/javascript'. The compiled files can then be served by running 'npm run serve', or 
'node compiled/server.js'.

Technologies used in this project:
* node
* express
* html
* css
* jquery
* mongodb
* react
* d3
* socket.io

Addtional packages of note:
* babel-compile
