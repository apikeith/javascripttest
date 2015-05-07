var async = require('async');
var SensorTag = require('sensortag');
var tempoiq = require('tempoiq');
var sTag;
var tClient;
var config = true;

module.exports = { 
      getMagData: function getMagData(sensorTag, client, pollPeriod, callback){
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
	  		      function(callback) {
	  		        console.log('enableMagnetometer');
	  		        sTag.enableMagnetometer(callback);
	  		      },
	  		      function(callback) {
	  		        setTimeout(callback, 1000);
	  		      },
	  		      function(callback) {
	  		          console.log('readMagnetometer');
	  		          sTag.readMagnetometer(function(error, x, y, z) {
	  		              //console.log('\tx = %d μT', x.toFixed(1));
	  		              console.log('\ty = %d μT', y.toFixed(1));
	  		              var curMag = y.toFixed(1);
	  		              reportData(sTag.uuid, curMag, "magnetometer");
	  		              if (config){
	  		            	reportData("config-" + sTag.uuid, curMag, "magnetometer");
	  		            	config = false;
	  		              }
	  		            });   
	  		          
	  		          callback();          
	  		      },
	  		      function(callback) {
	  		        console.log('disableMagnetometer');
	  		        sTag.disableMagnetometer(callback);
	  		      }
	  		    ]
	  		  );
	  
}
