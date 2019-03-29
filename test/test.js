/*
 * Test runner
 *
 */

 

// Application logic for the test runner
_app = {};

// Dependencies
_myserver = require('./../app/lib');
var config=require('./../app/config');
var assert = require('assert');
var http = require('http');
var util = require('util');
var debug = util.debuglog('server');



 

_app.testValues = {
    low: 0,
    high: 4,
    testpalindrome: 'level',
    correcturl: '/hello',
    badurl: '/random/url',
};
_app.makeGetRequest = function(path,callback){
  // Configure the request details
  var requestDetails = {
    'protocol' : 'http:',
    'hostname' : 'localhost',
    'port' : config.httpPort,
    'method' : 'GET',
    'path' : path,
    'headers' : {
      'Content-Type' : 'application/json'
    }
  };
    
  // Send the request
  var req = http.request(requestDetails,function(res){    
      try{
          callback(res.statusCode);
      }catch(e){
          debug(e);
          callback(404);
      }
          
  });
  req.end();
};
// Holder for Tests
_app.unit = {};




// Assert that the getANumber function is returning a number
_app.unit['myserver.getANumber should return a number'] = function(done){
  var val = _myserver.getANumber();
  assert.equal(typeof(val), 'number');
  done();
};

// getARandomNumber function should return a number higher than 3
_app.unit['myserver.getARamdomNumber should return a number higher than 3'] = function(done){
  var val = _myserver.getARamdomNumber(_app.testValues.low, _app.testValues.high);
  assert.equal((val>3), true);
  done();
};

// myserver.getAPalindrome should return true if the string is a palindrome
_app.unit['myserver.getAPalindrome should return true if the string is a palindrome'] = function(done){
  var val = _myserver.getAPalindrome(_app.testValues.testpalindrome);
  assert.equal(val, true, 'this assertion is false');
  done();
};

// _myserver.init() function should be able to run without throwing.
_app.unit['_myserver.init should start without throwing'] = function(done){
  assert.doesNotThrow(function(){
    done();  
  },TypeError);
};


// /hello should respond to GET with 200
_app.unit['/hello should respond to GET with 200'] = function(done){
  _app.makeGetRequest(_app.testValues.correcturl,function(res){
    assert.equal(res,200);
    done();
  });
};    
// /hello should respond to GET with 200
_app.unit['/random/url should respond to GET with 404'] = function(done){
  _app.makeGetRequest(_app.testValues.badurl,function(res){
    assert.equal(res,404);
    done();
  });
};
  












// Count all the tests
_app.countTests = function(){
  var counter = 0;
  for(var key in _app.unit){
     if(_app.unit.hasOwnProperty(key)){
       counter++;
     }
  }
  return counter;
};

// Run all the tests, collecting the errors and successes
_app.runTests = function(){
    _myserver.init(function(){
         var errors = [];
          var successes = 0;
          var limit = _app.countTests();
          var counter = 0;
          for(var key in _app.unit){
             if(_app.unit.hasOwnProperty(key)){
               var subTests = _app.unit[key];
               //for(var testName in subTests){
                  //if(subTests.hasOwnProperty(testName)){
                    (function(){
                      var tmpTestName = key;
                      var testValue = _app.unit[key];
                      // Call the test
                      try{
                        testValue(function(){

                          // If it calls back without throwing, then it succeeded, so log it in green
                          console.log('\x1b[32m%s\x1b[0m',tmpTestName);
                          counter++;
                          successes++;
                          if(counter == limit){
                            _app.produceTestReport(limit,successes,errors);
                          }
                        });
                      } catch(e){
                        // If it throws, then it failed, so capture the error thrown and log it in red
                        errors.push({
                          'name' : tmpTestName,
                          'error' : e
                        });
                        console.log('\x1b[31m%s\x1b[0m',tmpTestName);
                        counter++;
                        if(counter == limit){
                          _app.produceTestReport(limit,successes,errors);
                        }
                      }
                    })();
                  //}
               //}
             }
          }
        
  });
};


// Product a test outcome report
_app.produceTestReport = function(limit,successes,errors){
  console.log("");
  console.log("--------BEGIN TEST REPORT--------");
  console.log("");
  console.log("Total Tests: ",limit);
  console.log("Pass: ",successes);
  console.log("Fail: ",errors.length);
  console.log("");

  // If there are errors, print them in detail
  if(errors.length > 0){
    console.log("--------BEGIN ERROR DETAILS--------");
    console.log("");
    errors.forEach(function(testError){
      console.log('\x1b[31m%s\x1b[0m',testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------END ERROR DETAILS--------");
  }
  console.log("");
  console.log("--------END TEST REPORT--------");
  process.exit(0);

};


_app.runTests();

