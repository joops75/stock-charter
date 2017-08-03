'use strict';

var appUrl = window.location.origin;

var ajaxFunctions = {
  ready: function ready(fn) {
    if (typeof fn !== 'function') {
      return;
    }
    if (document.readyState === 'complete') {
      return fn();
    }
    document.addEventListener('DOMContentLoaded', fn, false);
  },
  ajaxRequest: function ajaxRequest(method, url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        callback(xmlhttp.response);
      }
    };
    xmlhttp.open(method, url, true);
    xmlhttp.send();
  },
  // ajaxSaveRequest: function ajaxRequest(method, url, data, callback) {//method doesn't work on Heroku (data too large for request header)
  //   var xmlhttp = new XMLHttpRequest()
  //   xmlhttp.onreadystatechange = function() {
  //     if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
  //       callback(xmlhttp.response)
  //     }
  //   }
  //   xmlhttp.open(method, url, true)
  //   xmlhttp.setRequestHeader("stockdata", data)
  //   xmlhttp.send()
  // },
  ajaxDeleteRequest: function ajaxRequest(method, url, symbol, callback) {
    //generates xml error at /api/stocks in firefox but still works (chrome all ok)
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        callback(xmlhttp.response);
      }
    };
    xmlhttp.open(method, url, true);
    xmlhttp.setRequestHeader("symboldata", symbol);
    xmlhttp.send();
  }
};
//# sourceMappingURL=ajax-functions.js.map
