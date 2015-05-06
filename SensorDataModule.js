var IRTemp = require('IRDataModule');
var MagData = require('MagDataModule');
var util = require('util');
var async = require('async');
var SensorTag = require('sensortag');
var tempoiq = require('tempoiq');
var USE_READ = true;
var prevMag = {};
var prevAmb = {};
var magThreshold = 1;
var ambThreshold = 1;
var pollPeriod = 500;
var x = 1;

var client = new tempoiq.Client("87d96890010d47f8ae37d089c8d26e43", "838dba057a254059a436666f728fbd87", "ttmlco-trial.backend.tempoiq.com");


SensorTag.discoverAll(function(sensorTag) {
  console.log('discovered: ' + sensorTag);
  
  client.createDevice(new tempoiq.Device(sensorTag.uuid,
	{
	    name: "SensorTag-" + sensorTag.uuid,
	    attributes: {
	      model: "v1"
	    },
	    sensors: [
	      new tempoiq.Sensor("temperature"),
	      new tempoiq.Sensor("magnetometer")
	    ]
	}), function(err, device) {
	  console.log("Device created: " + device.key);
	});
  
  
  sensorTag.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(0);
  });
  
  executeAsync(sensorTag);
});
 
  
function executeAsync(sensorTag){  
	  async.series([
	      function (callback) {
	        console.log('connectAndSetUp');
	        sensorTag.connectAndSetUp(callback);
	      }, function (callback){
	    	  while (x == 1) {
		    	async.parallel([
		    	    MagData.getMagData(sensorTag, client),
		    	    IRTemp.getIRTemp(sensorTag, client)
		    	]);
	    	  }
	      },
	      function(callback) {
	        console.log('disconnect');
	        sensorTag.disconnect(callback);
	      }
	    ]
	  );
}


