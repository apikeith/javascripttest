var async = require('async');
var SensorTag = require('sensortag');
var tempoiq = require('tempoiq');
var x = 1;

module.exports = { 
      getMagData: function getMagData(sensorTag, client, pollPeriod, callback){
   	  
		  async.series([
		      function(callback) {
		        console.log('enableMagnetometer');
		        sensorTag.enableMagnetometer(callback);
		      },
		      function(callback) {
		          console.log('readMagnetometer');
		          readData(sensorTag, client, pollPeriod);
		          
		          callback();          
		      },
		      function(callback) {
		        console.log('disableMagnetometer');
		        sensorTag.disableMagnetometer(callback);
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


function readData(sensorTag, client, pollPeriod){
    sensorTag.readMagnetometer(function(error, x, y, z) {
        //console.log('\tx = %d μT', x.toFixed(1));
        console.log('\ty = %d μT', y.toFixed(1));
        var curMag = y.toFixed(1);
        reportData(sensorTag.uuid, curMag, "magnetometer", client);
      });   
    pauseScript(pollPeriod);
    readData(sensorTag, client, pollPeriod);
}

function pauseScript(millis){
 var date = new Date();
 var curDate = null;
 do { curDate = new Date(); }
 while(curDate-date < millis);
}