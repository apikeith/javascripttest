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

    while (x==1) {
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
		
		  async.series([
		      function(callback) {
		        console.log('connectAndSetUp');
		        sensorTag.connectAndSetUp(callback);
		      },
		      function(callback) {
		        console.log('enableIrTemperature');
		        sensorTag.enableIrTemperature(callback);
		      },
		      function(callback) {
		        setTimeout(callback, 2000);
		      },
		      function(callback) {
		
		          console.log('readIrTemperature');
		          sensorTag.readIrTemperature(function(error, objectTemperature, ambientTemperature) {
		            //console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
		            console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));
		            var curAmb = ambientTemperature.toFixed(1);
		            if (curAmb != prevAmb){
		            	var maxAmb = curAmb + 1;
		            	var minAmb = curAmb - 1;
		            	if ((!prevAmb[sensorTag.uuid]) || (prevAmb[sensorTag.uuid] >= maxAmb) || (prevAmb[sensorTag.uuid] <= minAmb)) {
		            		reportData(sensorTag.uuid, curAmb, "temperature");
		            		prevAmb[sensorTag.uuid] = curAmb;
		            	}
		            	
		            }
		            
		            callback();
		          });
		      },
		      function(callback) {
		        console.log('disableIrTemperature');
		        sensorTag.disableIrTemperature(callback);
		      },
		
		      function(callback) {
		        console.log('enableMagnetometer');
		        sensorTag.enableMagnetometer(callback);
		      },
		      function(callback) {
		        setTimeout(callback, 2000);
		      },
		      function(callback) {
		          console.log('readMagnetometer');
		          sensorTag.readMagnetometer(function(error, x, y, z) {
		            //console.log('\tx = %d μT', x.toFixed(1));
		        	
		            console.log('\ty = %d μT', y.toFixed(1));
		            var curMag = y.toFixed(1);
		            if (curMag != prevMag){
		            	var maxMag = curMag + magThreshold;
		            	var minMag = curMag - magThreshold;
		            	if ((!prevMag[sensorTag.uuid]) || (prevMag[sensorTag.uuid] >= maxMag) || (prevMag[sensorTag.uuid] <= minMag)){
		            		reportData(sensorTag.uuid, curMag, "magnetometer");
		            		prevMag[sensorTag.uuid] = curMag;
		            	}
		            	
		            }
		            
		            //console.log('\tz = %d μT', z.toFixed(1));
		
		            callback();
		          });   
		      },
		      function(callback) {
		        console.log('disableMagnetometer');
		        sensorTag.disableMagnetometer(callback);
		      },
		      function(callback) {
		        console.log('disconnect');
		        sensorTag.disconnect(callback);
		      }
		    ]
		  );
		});
		pauseScript(pollPeriod);
    }


function pauseScript(millis) {
	var date = new Date();
	var curDate = null;
	do { curDate = new Date(); }
	while(curDate-date < millis);
}

function reportData(uuid, data, type){
	var device = uuid;
	var t1 = new Date();

	var tempdata = new tempoiq.BulkWrite();

	tempdata.push(device, type,
	          new tempoiq.DataPoint(t1, data));

	client.writeBulk(tempdata, function(err) {
	    if (err) throw err;
	});
}
