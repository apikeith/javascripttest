var async = require('async');
var SensorTag = require('sensortag');
var tempoiq = require('tempoiq');
var sTag;
var tClient;
var config = true;

module.exports = {
		
	getIRTemp: function getIRTemp(sensorTag, client, pollPeriod, callback){
		sTag = sensorTag;
		tClient = client;
		setInterval(readData, pollPeriod);
	}
}


function reportData(uuid, data, type){
	var device = uuid;
	var t1 = new Date();

	var tempdata = new tempoiq.BulkWrite();

	tempdata.push(device, type,
	          new tempoiq.DataPoint(t1, Number(data)));
    console.log(JSON.stringify(tempdata.toJSON()));
	tClient.writeBulk(tempdata, function(err) {
	    if (err) throw err;
	});
}


function readData(){
	  async.series([
  		      function (callback) {
  		        console.log('enableIrTemperature');
  		        sTag.enableIrTemperature(callback);
  		      }, 
  		      function(callback) {
		        setTimeout(callback, 1000);
		      },
  		      function readIR(callback) {
  		          console.log('readIrTemperature');
  		          sTag.readIrTemperature(function(error, objectTemperature, ambientTemperature) {
  		      	    //console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
  		      	    console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));
  		      	    var curAmb = ambientTemperature.toFixed(1);
  		      	    reportData(sTag.uuid, curAmb, "temperature");
  	                if (config){
		            	reportData("config-" + sTag.uuid, curMag, "temperature");
		            	config = false;
		            }
  		          });
  		          
  		          callback();
  		      },
  		      function (callback) {
  		        console.log('disableIrTemperature');
  		        sTag.disableIrTemperature(callback);
  		      }
  		    ]
  		  );
}
