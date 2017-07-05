importScripts("../../../bower_components/requirejs/require.js");
requirejs.config({
  //Lib path
  baseUrl: '.'
});
requirejs(['/js/jdataview/jdataview.js'], (jDataView)=> {
  var totalByteLength;

  self.postMessage({message: 'worker.loaded'});

  self.onmessage = function (e) {
    if (e.data.message === 'start') {
      convertGnuData(e.data.arrayBuffer);
    }
  };

  function broadcastProgress(loaded) {
    self.postMessage({message: 'gnu.conversation.progress', total: totalByteLength, loaded: loaded});
  }

  function convertGnuData(arrayBuffer) {
    var dv = new jDataView(arrayBuffer);
    var pos = 0;
    totalByteLength = arrayBuffer.byteLength;

    // FFTSize
    var fftSizeInt = 1024;
    var frameBytes =
      +8 // Timestamp bytes
      + 4 // FFTSize
      + 4 // Samplerate
      + 4;// Baseband

    // Data size
    var dataSize = dv.getUint32(pos, false);
    pos += 4;
    broadcastProgress(pos);

    //Size of frame + 8 byte of timestamp
    var lengthOfFrame = (fftSizeInt + 1) * 4 + frameBytes;

    var result = [];

    var proceedData = function () {
      // Timestamp
      var timeStamp = dv.getUint64(pos, false).toString();
      pos += 8;
      broadcastProgress(pos);

      // FTTSize
      var ffts = dv.getUint32(pos, false);
      pos += 4;
      broadcastProgress(pos);

      // Samplerate
      var sampleRateInt = dv.getFloat32(pos, false);
      pos += 4;
      broadcastProgress(pos);

      // Base frequency
      var baseFreqInt = dv.getFloat32(pos, false);
      pos += 4;
      broadcastProgress(pos);

      // Calculate scale factor
      var scaleFactor = Math.max(baseFreqInt, sampleRateInt);
      if (scaleFactor > 1e9)
        scaleFactor = 1e-9;
      else if (scaleFactor > 1e6)
        scaleFactor = 1e-6;
      else
        scaleFactor = 1e-3;

      // Frequencies
      // var freqs = [];
      var freqs = new Array(fftSizeInt + 1);
      for (var ii = -fftSizeInt / 2; ii < fftSizeInt / 2 + 1; ii++) {
        freqs[fftSizeInt / 2 + ii] = ii * sampleRateInt * scaleFactor / fftSizeInt + baseFreqInt * scaleFactor;
      }

      var freqIncreasement = 0;
      var timeStampData = [];

      for (var j = 0; j < lengthOfFrame - frameBytes; j += 4) {
        var bigEndianData = dv.getFloat32(pos, true);
        pos += 4;
        broadcastProgress(pos);
        timeStampData.push({
          x: freqs[freqIncreasement++],
          y: bigEndianData
        });
      }

      result.push({
        timestamp: parseInt(timeStamp),
        data: timeStampData,
        baseFreq: baseFreqInt,
        sampleRate: sampleRateInt,
        fftSize: fftSizeInt
      });

      if (pos < totalByteLength) {
        setTimeout(function () {
          proceedData();
        }, 500);
      } else {
        self.postMessage({message: 'gnu.conversation.completed', result: result});
      }
    };

    proceedData();

    //
    // do {
    //   // Timestamp
    //   var timeStamp = dv.getUint64(pos, false).toString();
    //   pos += 8;
    //   broadcastProgress(pos);
    //
    //   // FTTSize
    //   var ffts = dv.getUint32(pos, false);
    //   pos += 4;
    //   broadcastProgress(pos);
    //
    //   // Samplerate
    //   var sampleRateInt = dv.getFloat32(pos, false);
    //   pos += 4;
    //   broadcastProgress(pos);
    //
    //   // Base frequency
    //   var baseFreqInt = dv.getFloat32(pos, false);
    //   pos += 4;
    //   broadcastProgress(pos);
    //
    //   // Calculate scale factor
    //   var scaleFactor = Math.max(baseFreqInt, sampleRateInt);
    //   if (scaleFactor > 1e9)
    //     scaleFactor = 1e-9;
    //   else if (scaleFactor > 1e6)
    //     scaleFactor = 1e-6;
    //   else
    //     scaleFactor = 1e-3;
    //
    //   // Frequencies
    //   // var freqs = [];
    //   var freqs = new Array(fftSizeInt + 1);
    //   for (var ii = -fftSizeInt / 2; ii < fftSizeInt / 2 + 1; ii++) {
    //     freqs[fftSizeInt / 2 + ii] = ii * sampleRateInt * scaleFactor / fftSizeInt + baseFreqInt * scaleFactor;
    //   }
    //
    //   var freqIncreasement = 0;
    //   var timeStampData = [];
    //
    //     for (var j = 0; j < lengthOfFrame - frameBytes; j += 4) {
    //       var bigEndianData = dv.getFloat32(pos, true);
    //       pos += 4;
    //       broadcastProgress(pos);
    //       timeStampData.push({
    //         x: freqs[freqIncreasement++],
    //         y: bigEndianData
    //       });
    //     }
    //
    //     result.push({
    //       timestamp: parseInt(timeStamp),
    //       data: timeStampData,
    //       baseFreq: baseFreqInt,
    //       sampleRate: sampleRateInt,
    //       fftSize: fftSizeInt
    //     });
    // } while (pos < totalByteLength);
    // self.postMessage({message: 'gnu.conversation.completed', result: result});


    // var bufferArray = arrayBuffer;
    // var loaded = 0;
    // totalByteLength = bufferArray.byteLength;
    //
    // // FFTSize
    // var fftSizeInt = 1024;
    // var frameBytes =
    //   +8 // Timestamp bytes
    //   + 4 // FFTSize
    //   + 4 // Samplerate
    //   + 4;// Baseband
    //
    // // Data size
    // bufferArray = bufferArray.slice(4);
    // loaded += 4;
    // broadcastProgress(loaded);
    // var dataSize = bufferArray.byteLength;
    //
    // //Size of frame + 8 byte of timestamp
    // var lengthOfFrame = (fftSizeInt + 1) * 4 + frameBytes;
    //
    // var result = [];
    // //Get Gnu data from file
    // for (var i = 0; i < dataSize; i += lengthOfFrame) {
    //   var dv = new jDataView(bufferArray);
    //   // Timestamp
    //   var timeStamp = dv.getUint64(0, false).toString();
    //   bufferArray = bufferArray.slice(8);
    //   loaded += 8;
    //   broadcastProgress(loaded);
    //
    //   // FTTSize
    //   bufferArray = bufferArray.slice(4);
    //   loaded += 4;
    //   broadcastProgress(loaded);
    //
    //   // Samplerate
    //   var sampleRate = new Uint8Array(bufferArray, 0, 4).reverse();
    //   // Convert 4 bytes to int
    //   var sampleRateInt = new Float32Array(sampleRate.buffer)[0];
    //   loaded += 4;
    //   bufferArray = bufferArray.slice(4);
    //   broadcastProgress(loaded);
    //
    //   // Base frequency
    //   var baseFreq = new Uint8Array(bufferArray, 0, 4).reverse();
    //   // Convert 4 bytes to int
    //   var baseFreqInt = new Float32Array(baseFreq.buffer)[0];
    //   loaded += 4;
    //   bufferArray = bufferArray.slice(4);
    //   broadcastProgress(loaded);
    //
    //   // Calculate scale factor
    //   var scaleFactor = Math.max(baseFreqInt, sampleRateInt);
    //   if (scaleFactor > 1e9)
    //     scaleFactor = 1e-9;
    //   else if (scaleFactor > 1e6)
    //     scaleFactor = 1e-6;
    //   else
    //     scaleFactor = 1e-3;
    //
    //   // Frequencies
    //   // var freqs = [];
    //   var freqs = new Array(fftSizeInt + 1);
    //   for (var ii = -fftSizeInt / 2; ii < fftSizeInt / 2 + 1; ii++) {
    //     freqs[fftSizeInt / 2 + ii] = ii * sampleRateInt * scaleFactor / fftSizeInt + baseFreqInt * scaleFactor;
    //   }
    //
    //   var freqIncreasement = 0;
    //   var timeStampData = [];
    //
    //   for (var j = 0; j < lengthOfFrame - frameBytes; j += 4) {
    //     var bigEndianData = new Float32Array(new Uint8Array(bufferArray, 0, 4).buffer)[0];
    //     bufferArray = bufferArray.slice(4);
    //     loaded += 4;
    //     broadcastProgress(loaded);
    //     timeStampData.push({
    //       x: freqs[freqIncreasement++],
    //       y: bigEndianData
    //     });
    //   }
    //
    //   result.push({
    //     timestamp: parseInt(timeStamp),
    //     data: timeStampData,
    //     baseFreq: baseFreqInt,
    //     sampleRate: sampleRateInt,
    //     fftSize: fftSizeInt
    //   });
    // }

    // return result;
  }
});
