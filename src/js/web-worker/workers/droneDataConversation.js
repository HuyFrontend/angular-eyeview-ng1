importScripts("/bower_components/requirejs/require.js");
requirejs.config({
  //Lib path
  baseUrl: '.'
});
requirejs([
  '/js/jdataview/jdataview.js'
], (jDataView)=> {
  var totalByteLength;

  self.postMessage({message: 'worker.loaded'});

  self.onmessage = function (e) {
    if (e.data.message === 'start') {
      convertData(e.data.arrayBuffer);
    }
  };

  function broadcastProgress(loaded) {
    self.postMessage({message: 'drone.data.conversation.progress', total: totalByteLength, loaded: loaded});
  }

  function convertData(arrayBuffer) {
    var bufferArray = arrayBuffer;
    totalByteLength = bufferArray.byteLength;

    var dv = new jDataView(bufferArray);
    var pos = 0;

    // Data size
    // bufferArray = bufferArray.slice(4);

    var datasize = dv.getUint32(pos, false);
    pos += 4;
    broadcastProgress(pos);

    var result = [];

    var proceedData = function(){
      //Get length of json string
      var jsonLengthInt = dv.getUint32(pos, false);
      pos += 4;
      broadcastProgress(pos);

      // Timestamp
      var timeStamp = dv.getUint64(pos).toString();
      pos += 8;
      broadcastProgress(pos);

      // get drone data
      var droneData = dv.getString(jsonLengthInt, pos, 'utf-8');
      pos += jsonLengthInt;
      broadcastProgress(pos);

      // Prepair results
      var jsDroneData = JSON.parse(droneData);
      jsDroneData.timeStamp = timeStamp;
      result.push(jsDroneData);

      if (pos < totalByteLength) {
        setTimeout(function () {
          proceedData();
        }, 500);
      } else {
        self.postMessage({message: 'drone.data.conversation.completed', result: result});
      }
    };

    proceedData();

    // do
    // {
    //   //Get length of json string
    //   var jsonLengthInt = dv.getUint32(pos, false);
    //   pos += 4;
    //   broadcastProgress(pos);
    //
    //   // Timestamp
    //   var timeStamp = dv.getUint64(pos).toString();
    //   pos += 8;
    //   broadcastProgress(pos);
    //
    //   // get drone data
    //   var droneData = dv.getString(jsonLengthInt, pos, 'utf-8');
    //   pos += jsonLengthInt;
    //   broadcastProgress(pos);
    //
    //   // Prepair results
    //   var jsDroneData = JSON.parse(droneData);
    //   jsDroneData.timeStamp = timeStamp;
    //   result.push(jsDroneData);
    // } while (pos < bufferArray.byteLength);

    // return result;
    // self.postMessage({message: 'drone.data.conversation.completed', result: result});
  }
});
