/*
 * This library to be tested
 * 
*/


// Dependencies
var http=require('http');
var url=require('url');
var util = require('util');
var debug = util.debuglog('server');
var StringDecoder=require('string_decoder').StringDecoder;
var config=require('./config');

var myserver={};

 // Instantiate the HTTP server
    myserver.httpServer = http.createServer(function(req,res){
      myserver.unifiedServer(req,res);
    });
// function to lunch the server. The callback is because we want to be sure that the server is running before start the test.
myserver.init = function(callback){
   
    // Start the HTTP server
    myserver.httpServer.listen(config.httpPort,function(){
      //console.log(config.locale[config.applocale].server_on + config.httpPort +config.locale[config.applocale].server_mode); in comment because we don't want to see the on the console
    });
    callback();
}



// All the server logic 
myserver.unifiedServer = function(req,res){

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
      buffer += decoder.write(data);
  });
  req.on('end', function() {
      buffer += decoder.end();

       // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
       var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

       var data ={};
      if(trimmedPath==='hello'){
          // Construct the data object to send to the handler    
          data = {
            'gretings' : config.locale[config.applocale].greatings, 
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
          };        
      }
       // Route the request to the handler specified in the router
       chosenHandler(data,function(statusCode){

         // Use the status code returned from the handler, or set the default status code to 200
         statusCode = typeof(statusCode) == 'number' ? statusCode : 404;

         // Use the payload returned from the handler, or set the default payload to an empty object
         data = typeof(data) == 'object'? data : {};

         // Convert the payload to a string
         var message = JSON.stringify(data);

         // Return the response
         res.setHeader('Content-Type', 'application/json');
         res.writeHead(statusCode);
         res.end(message);

         
       });

  });
};

/*
*
*list of function that will be tested
*
*/

// fucntion must always retur a number, the port of server
myserver.getANumber = function(){
    return config.httpPort;
}
// function will return randomilly a number between low and high
myserver.getARamdomNumber = function(low,high){
    return Math.random() * (high - low) + low;
}
myserver.getAPalindrome = function(string){
    //remove all non alphanumeric characters
    string=string.replace(/[^\w]/gi, "").toLowerCase();
    //split() make an array, reverse() reverse that array and join() convert array to string in order to compare it to the old 
    return string == string.split('').reverse().join('');
}


// Define all the handlers
var handlers = {};

// Ping handler
handlers.hello = function(data,callback){
    callback(200);
};

// Not-Found handler
handlers.notFound = function(data,callback){
    callback(404);
};

// Define the request router
var router = {
  'hello' : handlers.hello,
  'notFound' : handlers.notFound    
};




// Self invoking only if required directly. We don't want to start the server just by requiring this library in an other file
if(require.main === module){
  myserver.init(function(){});
}


// Export the lib
module.exports = myserver;