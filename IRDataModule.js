var async = require('async');

module.exports = function getIRTemp(sensorTag, client){
	  async.series([
	      function (callback) {
	        console.log('enableIrTemperature');
	        sensorTag.enableIrTemperature(callback);
	      },
	      function (callback) {
	        setTimeout(callback, 2000);
	      },
	      function readIR(callback) {
	
	          console.log('readIrTemperature');
	          sensorTag.readIrTemperature(function(error, objectTemperature, ambientTemperature) {
	            //console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
	            console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));
	            var curAmb = ambientTemperature.toFixed(1);
	            if (curAmb != prevAmb){
	            	var maxAmb = curAmb + 1;
	            	var minAmb = curAmb - 1;
	            	if ((!prevAmb[sensorTag.uuid]) || (prevAmb[sensorTag.uuid] >= maxAmb) || (prevAmb[sensorTag.uuid] <= minAmb)) {
	            		reportData(sensorTag.uuid, curAmb, "temperature", client);
	            		prevAmb[sensorTag.uuid] = curAmb;
	            	}
	            	
	            }
	            
	            callback();
	          });
	      },
	      function (callback) {
	        console.log('disableIrTemperature');
	        sensorTag.disableIrTemperature(callback);
	      }
	    ]
	  );
	}


function reportData(uuid, data, type, client){
	var device = uuid;
	var t1 = new Date();

	var tempdata = new tempoiq.BulkWrite();

	tempdata.push(device, type,
	          new tempoiq.DataPoint(t1, parseFloat(data).toFixed(1)));

	client.writeBulk(tempdata, function(err) {
	    if (err) throw err;
	});
}
