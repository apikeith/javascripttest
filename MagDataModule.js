var async = require('async');

module.exports = function getMagData(sensorTag, client, pollPeriod){
  async.series([
      function(callback) {
        console.log('enableMagnetometer');
        sensorTag.enableMagnetometer(callback);
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
            		reportData(sensorTag.uuid, curMag, "magnetometer", client);
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
	    setTimeout(callback, pollPeriod);
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
