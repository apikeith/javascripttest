var async = require('async');
var SensorTag = require('sensortag');
var tempoiq = require('tempoiq');

module.exports = {
		
	getIRTemp: function getIRTemp(sensorTag, client, pollPeriod, callback){

		  async.series([
		      function (callback) {
		        console.log('enableIrTemperature');
		        sensorTag.enableIrTemperature(callback);
		      },
		      function readIR(callback) {
		          console.log('readIrTemperature');
		          while (x == 1){
		        	  setTimeout(readData(sensorTag, client), pollPeriod);
		          }
		          callback();
		      },
		      function (callback) {
		        console.log('disableIrTemperature');
		        sensorTag.disableIrTemperature(callback);
		      }
		    ]
		  );
		
		
	}
}


function reportData(uuid, data, type, client){
	var device = uuid;
	var t1 = new Date();

	var tempdata = new tempoiq.BulkWrite();

	tempdata.push(device, type,
	          new tempoiq.DataPoint(t1, Number(data)));
    console.log(JSON.stringify(tempdata.toJSON()));
	client.writeBulk(tempdata, function(err) {
	    if (err) throw err;
	});
}


function readData(sensorTag, client){
    sensorTag.readIrTemperature(function(error, objectTemperature, ambientTemperature) {
	    //console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
	    console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));
	    var curAmb = ambientTemperature.toFixed(1);
	    reportData(sensorTag.uuid, curAmb, "temperature", client);
    }
}