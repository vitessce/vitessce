import { i as inflate_1 } from "./pako.esm-f4dee50e.js";
import { g as getDefaultExportFromCjs, B as BaseDecoder } from "./index-bb7a1f3d.js";
import "react";
import "@vitessce/vit-s";
import "react-dom";
const LercParameters = {
  Version: 0,
  AddCompression: 1
};
const LercAddCompression = {
  None: 0,
  Deflate: 1,
  Zstandard: 2
};
var LercDecode = { exports: {} };
(function(module) {
  /* Copyright 2015-2021 Esri. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 @preserve */
  (function() {
    var LercDecode2 = function() {
      var CntZImage = {};
      CntZImage.defaultNoDataValue = -34027999387901484e22;
      CntZImage.decode = function(input, options) {
        options = options || {};
        var skipMask = options.encodedMaskData || options.encodedMaskData === null;
        var parsedData = parse(input, options.inputOffset || 0, skipMask);
        var noDataValue = options.noDataValue !== null ? options.noDataValue : CntZImage.defaultNoDataValue;
        var uncompressedData = uncompressPixelValues(
          parsedData,
          options.pixelType || Float32Array,
          options.encodedMaskData,
          noDataValue,
          options.returnMask
        );
        var result = {
          width: parsedData.width,
          height: parsedData.height,
          pixelData: uncompressedData.resultPixels,
          minValue: uncompressedData.minValue,
          maxValue: parsedData.pixels.maxValue,
          noDataValue
        };
        if (uncompressedData.resultMask) {
          result.maskData = uncompressedData.resultMask;
        }
        if (options.returnEncodedMask && parsedData.mask) {
          result.encodedMaskData = parsedData.mask.bitset ? parsedData.mask.bitset : null;
        }
        if (options.returnFileInfo) {
          result.fileInfo = formatFileInfo(parsedData);
          if (options.computeUsedBitDepths) {
            result.fileInfo.bitDepths = computeUsedBitDepths(parsedData);
          }
        }
        return result;
      };
      var uncompressPixelValues = function(data, TypedArrayClass, maskBitset, noDataValue, storeDecodedMask) {
        var blockIdx = 0;
        var numX = data.pixels.numBlocksX;
        var numY = data.pixels.numBlocksY;
        var blockWidth = Math.floor(data.width / numX);
        var blockHeight = Math.floor(data.height / numY);
        var scale = 2 * data.maxZError;
        var minValue = Number.MAX_VALUE, currentValue;
        maskBitset = maskBitset || (data.mask ? data.mask.bitset : null);
        var resultPixels, resultMask;
        resultPixels = new TypedArrayClass(data.width * data.height);
        if (storeDecodedMask && maskBitset) {
          resultMask = new Uint8Array(data.width * data.height);
        }
        var blockDataBuffer = new Float32Array(blockWidth * blockHeight);
        var xx, yy;
        for (var y = 0; y <= numY; y++) {
          var thisBlockHeight = y !== numY ? blockHeight : data.height % numY;
          if (thisBlockHeight === 0) {
            continue;
          }
          for (var x = 0; x <= numX; x++) {
            var thisBlockWidth = x !== numX ? blockWidth : data.width % numX;
            if (thisBlockWidth === 0) {
              continue;
            }
            var outPtr = y * data.width * blockHeight + x * blockWidth;
            var outStride = data.width - thisBlockWidth;
            var block = data.pixels.blocks[blockIdx];
            var blockData, blockPtr, constValue;
            if (block.encoding < 2) {
              if (block.encoding === 0) {
                blockData = block.rawData;
              } else {
                unstuff(block.stuffedData, block.bitsPerPixel, block.numValidPixels, block.offset, scale, blockDataBuffer, data.pixels.maxValue);
                blockData = blockDataBuffer;
              }
              blockPtr = 0;
            } else if (block.encoding === 2) {
              constValue = 0;
            } else {
              constValue = block.offset;
            }
            var maskByte;
            if (maskBitset) {
              for (yy = 0; yy < thisBlockHeight; yy++) {
                if (outPtr & 7) {
                  maskByte = maskBitset[outPtr >> 3];
                  maskByte <<= outPtr & 7;
                }
                for (xx = 0; xx < thisBlockWidth; xx++) {
                  if (!(outPtr & 7)) {
                    maskByte = maskBitset[outPtr >> 3];
                  }
                  if (maskByte & 128) {
                    if (resultMask) {
                      resultMask[outPtr] = 1;
                    }
                    currentValue = block.encoding < 2 ? blockData[blockPtr++] : constValue;
                    minValue = minValue > currentValue ? currentValue : minValue;
                    resultPixels[outPtr++] = currentValue;
                  } else {
                    if (resultMask) {
                      resultMask[outPtr] = 0;
                    }
                    resultPixels[outPtr++] = noDataValue;
                  }
                  maskByte <<= 1;
                }
                outPtr += outStride;
              }
            } else {
              if (block.encoding < 2) {
                for (yy = 0; yy < thisBlockHeight; yy++) {
                  for (xx = 0; xx < thisBlockWidth; xx++) {
                    currentValue = blockData[blockPtr++];
                    minValue = minValue > currentValue ? currentValue : minValue;
                    resultPixels[outPtr++] = currentValue;
                  }
                  outPtr += outStride;
                }
              } else {
                minValue = minValue > constValue ? constValue : minValue;
                for (yy = 0; yy < thisBlockHeight; yy++) {
                  for (xx = 0; xx < thisBlockWidth; xx++) {
                    resultPixels[outPtr++] = constValue;
                  }
                  outPtr += outStride;
                }
              }
            }
            if (block.encoding === 1 && blockPtr !== block.numValidPixels) {
              throw "Block and Mask do not match";
            }
            blockIdx++;
          }
        }
        return {
          resultPixels,
          resultMask,
          minValue
        };
      };
      var formatFileInfo = function(data) {
        return {
          "fileIdentifierString": data.fileIdentifierString,
          "fileVersion": data.fileVersion,
          "imageType": data.imageType,
          "height": data.height,
          "width": data.width,
          "maxZError": data.maxZError,
          "eofOffset": data.eofOffset,
          "mask": data.mask ? {
            "numBlocksX": data.mask.numBlocksX,
            "numBlocksY": data.mask.numBlocksY,
            "numBytes": data.mask.numBytes,
            "maxValue": data.mask.maxValue
          } : null,
          "pixels": {
            "numBlocksX": data.pixels.numBlocksX,
            "numBlocksY": data.pixels.numBlocksY,
            "numBytes": data.pixels.numBytes,
            "maxValue": data.pixels.maxValue,
            "noDataValue": data.noDataValue
          }
        };
      };
      var computeUsedBitDepths = function(data) {
        var numBlocks = data.pixels.numBlocksX * data.pixels.numBlocksY;
        var bitDepths = {};
        for (var i = 0; i < numBlocks; i++) {
          var block = data.pixels.blocks[i];
          if (block.encoding === 0) {
            bitDepths.float32 = true;
          } else if (block.encoding === 1) {
            bitDepths[block.bitsPerPixel] = true;
          } else {
            bitDepths[0] = true;
          }
        }
        return Object.keys(bitDepths);
      };
      var parse = function(input, fp, skipMask) {
        var data = {};
        var fileIdView = new Uint8Array(input, fp, 10);
        data.fileIdentifierString = String.fromCharCode.apply(null, fileIdView);
        if (data.fileIdentifierString.trim() !== "CntZImage") {
          throw "Unexpected file identifier string: " + data.fileIdentifierString;
        }
        fp += 10;
        var view = new DataView(input, fp, 24);
        data.fileVersion = view.getInt32(0, true);
        data.imageType = view.getInt32(4, true);
        data.height = view.getUint32(8, true);
        data.width = view.getUint32(12, true);
        data.maxZError = view.getFloat64(16, true);
        fp += 24;
        if (!skipMask) {
          view = new DataView(input, fp, 16);
          data.mask = {};
          data.mask.numBlocksY = view.getUint32(0, true);
          data.mask.numBlocksX = view.getUint32(4, true);
          data.mask.numBytes = view.getUint32(8, true);
          data.mask.maxValue = view.getFloat32(12, true);
          fp += 16;
          if (data.mask.numBytes > 0) {
            var bitset = new Uint8Array(Math.ceil(data.width * data.height / 8));
            view = new DataView(input, fp, data.mask.numBytes);
            var cnt = view.getInt16(0, true);
            var ip = 2, op = 0;
            do {
              if (cnt > 0) {
                while (cnt--) {
                  bitset[op++] = view.getUint8(ip++);
                }
              } else {
                var val = view.getUint8(ip++);
                cnt = -cnt;
                while (cnt--) {
                  bitset[op++] = val;
                }
              }
              cnt = view.getInt16(ip, true);
              ip += 2;
            } while (ip < data.mask.numBytes);
            if (cnt !== -32768 || op < bitset.length) {
              throw "Unexpected end of mask RLE encoding";
            }
            data.mask.bitset = bitset;
            fp += data.mask.numBytes;
          } else if ((data.mask.numBytes | data.mask.numBlocksY | data.mask.maxValue) === 0) {
            data.mask.bitset = new Uint8Array(Math.ceil(data.width * data.height / 8));
          }
        }
        view = new DataView(input, fp, 16);
        data.pixels = {};
        data.pixels.numBlocksY = view.getUint32(0, true);
        data.pixels.numBlocksX = view.getUint32(4, true);
        data.pixels.numBytes = view.getUint32(8, true);
        data.pixels.maxValue = view.getFloat32(12, true);
        fp += 16;
        var numBlocksX = data.pixels.numBlocksX;
        var numBlocksY = data.pixels.numBlocksY;
        var actualNumBlocksX = numBlocksX + (data.width % numBlocksX > 0 ? 1 : 0);
        var actualNumBlocksY = numBlocksY + (data.height % numBlocksY > 0 ? 1 : 0);
        data.pixels.blocks = new Array(actualNumBlocksX * actualNumBlocksY);
        var blockI = 0;
        for (var blockY = 0; blockY < actualNumBlocksY; blockY++) {
          for (var blockX = 0; blockX < actualNumBlocksX; blockX++) {
            var size = 0;
            var bytesLeft = input.byteLength - fp;
            view = new DataView(input, fp, Math.min(10, bytesLeft));
            var block = {};
            data.pixels.blocks[blockI++] = block;
            var headerByte = view.getUint8(0);
            size++;
            block.encoding = headerByte & 63;
            if (block.encoding > 3) {
              throw "Invalid block encoding (" + block.encoding + ")";
            }
            if (block.encoding === 2) {
              fp++;
              continue;
            }
            if (headerByte !== 0 && headerByte !== 2) {
              headerByte >>= 6;
              block.offsetType = headerByte;
              if (headerByte === 2) {
                block.offset = view.getInt8(1);
                size++;
              } else if (headerByte === 1) {
                block.offset = view.getInt16(1, true);
                size += 2;
              } else if (headerByte === 0) {
                block.offset = view.getFloat32(1, true);
                size += 4;
              } else {
                throw "Invalid block offset type";
              }
              if (block.encoding === 1) {
                headerByte = view.getUint8(size);
                size++;
                block.bitsPerPixel = headerByte & 63;
                headerByte >>= 6;
                block.numValidPixelsType = headerByte;
                if (headerByte === 2) {
                  block.numValidPixels = view.getUint8(size);
                  size++;
                } else if (headerByte === 1) {
                  block.numValidPixels = view.getUint16(size, true);
                  size += 2;
                } else if (headerByte === 0) {
                  block.numValidPixels = view.getUint32(size, true);
                  size += 4;
                } else {
                  throw "Invalid valid pixel count type";
                }
              }
            }
            fp += size;
            if (block.encoding === 3) {
              continue;
            }
            var arrayBuf, store8;
            if (block.encoding === 0) {
              var numPixels = (data.pixels.numBytes - 1) / 4;
              if (numPixels !== Math.floor(numPixels)) {
                throw "uncompressed block has invalid length";
              }
              arrayBuf = new ArrayBuffer(numPixels * 4);
              store8 = new Uint8Array(arrayBuf);
              store8.set(new Uint8Array(input, fp, numPixels * 4));
              var rawData = new Float32Array(arrayBuf);
              block.rawData = rawData;
              fp += numPixels * 4;
            } else if (block.encoding === 1) {
              var dataBytes = Math.ceil(block.numValidPixels * block.bitsPerPixel / 8);
              var dataWords = Math.ceil(dataBytes / 4);
              arrayBuf = new ArrayBuffer(dataWords * 4);
              store8 = new Uint8Array(arrayBuf);
              store8.set(new Uint8Array(input, fp, dataBytes));
              block.stuffedData = new Uint32Array(arrayBuf);
              fp += dataBytes;
            }
          }
        }
        data.eofOffset = fp;
        return data;
      };
      var unstuff = function(src, bitsPerPixel, numPixels, offset, scale, dest, maxValue) {
        var bitMask = (1 << bitsPerPixel) - 1;
        var i = 0, o;
        var bitsLeft = 0;
        var n, buffer;
        var nmax = Math.ceil((maxValue - offset) / scale);
        var numInvalidTailBytes = src.length * 4 - Math.ceil(bitsPerPixel * numPixels / 8);
        src[src.length - 1] <<= 8 * numInvalidTailBytes;
        for (o = 0; o < numPixels; o++) {
          if (bitsLeft === 0) {
            buffer = src[i++];
            bitsLeft = 32;
          }
          if (bitsLeft >= bitsPerPixel) {
            n = buffer >>> bitsLeft - bitsPerPixel & bitMask;
            bitsLeft -= bitsPerPixel;
          } else {
            var missingBits = bitsPerPixel - bitsLeft;
            n = (buffer & bitMask) << missingBits & bitMask;
            buffer = src[i++];
            bitsLeft = 32 - missingBits;
            n += buffer >>> bitsLeft;
          }
          dest[o] = n < nmax ? offset + n * scale : maxValue;
        }
        return dest;
      };
      return CntZImage;
    }();
    var Lerc2Decode = function() {
      var BitStuffer = {
        //methods ending with 2 are for the new byte order used by Lerc2.3 and above.
        //originalUnstuff is used to unpack Huffman code table. code is duplicated to unstuffx for performance reasons.
        unstuff: function(src, dest, bitsPerPixel, numPixels, lutArr, offset, scale, maxValue) {
          var bitMask = (1 << bitsPerPixel) - 1;
          var i = 0, o;
          var bitsLeft = 0;
          var n, buffer, missingBits, nmax;
          var numInvalidTailBytes = src.length * 4 - Math.ceil(bitsPerPixel * numPixels / 8);
          src[src.length - 1] <<= 8 * numInvalidTailBytes;
          if (lutArr) {
            for (o = 0; o < numPixels; o++) {
              if (bitsLeft === 0) {
                buffer = src[i++];
                bitsLeft = 32;
              }
              if (bitsLeft >= bitsPerPixel) {
                n = buffer >>> bitsLeft - bitsPerPixel & bitMask;
                bitsLeft -= bitsPerPixel;
              } else {
                missingBits = bitsPerPixel - bitsLeft;
                n = (buffer & bitMask) << missingBits & bitMask;
                buffer = src[i++];
                bitsLeft = 32 - missingBits;
                n += buffer >>> bitsLeft;
              }
              dest[o] = lutArr[n];
            }
          } else {
            nmax = Math.ceil((maxValue - offset) / scale);
            for (o = 0; o < numPixels; o++) {
              if (bitsLeft === 0) {
                buffer = src[i++];
                bitsLeft = 32;
              }
              if (bitsLeft >= bitsPerPixel) {
                n = buffer >>> bitsLeft - bitsPerPixel & bitMask;
                bitsLeft -= bitsPerPixel;
              } else {
                missingBits = bitsPerPixel - bitsLeft;
                n = (buffer & bitMask) << missingBits & bitMask;
                buffer = src[i++];
                bitsLeft = 32 - missingBits;
                n += buffer >>> bitsLeft;
              }
              dest[o] = n < nmax ? offset + n * scale : maxValue;
            }
          }
        },
        unstuffLUT: function(src, bitsPerPixel, numPixels, offset, scale, maxValue) {
          var bitMask = (1 << bitsPerPixel) - 1;
          var i = 0, o = 0, missingBits = 0, bitsLeft = 0, n = 0;
          var buffer;
          var dest = [];
          var numInvalidTailBytes = src.length * 4 - Math.ceil(bitsPerPixel * numPixels / 8);
          src[src.length - 1] <<= 8 * numInvalidTailBytes;
          var nmax = Math.ceil((maxValue - offset) / scale);
          for (o = 0; o < numPixels; o++) {
            if (bitsLeft === 0) {
              buffer = src[i++];
              bitsLeft = 32;
            }
            if (bitsLeft >= bitsPerPixel) {
              n = buffer >>> bitsLeft - bitsPerPixel & bitMask;
              bitsLeft -= bitsPerPixel;
            } else {
              missingBits = bitsPerPixel - bitsLeft;
              n = (buffer & bitMask) << missingBits & bitMask;
              buffer = src[i++];
              bitsLeft = 32 - missingBits;
              n += buffer >>> bitsLeft;
            }
            dest[o] = n < nmax ? offset + n * scale : maxValue;
          }
          dest.unshift(offset);
          return dest;
        },
        unstuff2: function(src, dest, bitsPerPixel, numPixels, lutArr, offset, scale, maxValue) {
          var bitMask = (1 << bitsPerPixel) - 1;
          var i = 0, o;
          var bitsLeft = 0, bitPos = 0;
          var n, buffer, missingBits;
          if (lutArr) {
            for (o = 0; o < numPixels; o++) {
              if (bitsLeft === 0) {
                buffer = src[i++];
                bitsLeft = 32;
                bitPos = 0;
              }
              if (bitsLeft >= bitsPerPixel) {
                n = buffer >>> bitPos & bitMask;
                bitsLeft -= bitsPerPixel;
                bitPos += bitsPerPixel;
              } else {
                missingBits = bitsPerPixel - bitsLeft;
                n = buffer >>> bitPos & bitMask;
                buffer = src[i++];
                bitsLeft = 32 - missingBits;
                n |= (buffer & (1 << missingBits) - 1) << bitsPerPixel - missingBits;
                bitPos = missingBits;
              }
              dest[o] = lutArr[n];
            }
          } else {
            var nmax = Math.ceil((maxValue - offset) / scale);
            for (o = 0; o < numPixels; o++) {
              if (bitsLeft === 0) {
                buffer = src[i++];
                bitsLeft = 32;
                bitPos = 0;
              }
              if (bitsLeft >= bitsPerPixel) {
                n = buffer >>> bitPos & bitMask;
                bitsLeft -= bitsPerPixel;
                bitPos += bitsPerPixel;
              } else {
                missingBits = bitsPerPixel - bitsLeft;
                n = buffer >>> bitPos & bitMask;
                buffer = src[i++];
                bitsLeft = 32 - missingBits;
                n |= (buffer & (1 << missingBits) - 1) << bitsPerPixel - missingBits;
                bitPos = missingBits;
              }
              dest[o] = n < nmax ? offset + n * scale : maxValue;
            }
          }
          return dest;
        },
        unstuffLUT2: function(src, bitsPerPixel, numPixels, offset, scale, maxValue) {
          var bitMask = (1 << bitsPerPixel) - 1;
          var i = 0, o = 0, missingBits = 0, bitsLeft = 0, n = 0, bitPos = 0;
          var buffer;
          var dest = [];
          var nmax = Math.ceil((maxValue - offset) / scale);
          for (o = 0; o < numPixels; o++) {
            if (bitsLeft === 0) {
              buffer = src[i++];
              bitsLeft = 32;
              bitPos = 0;
            }
            if (bitsLeft >= bitsPerPixel) {
              n = buffer >>> bitPos & bitMask;
              bitsLeft -= bitsPerPixel;
              bitPos += bitsPerPixel;
            } else {
              missingBits = bitsPerPixel - bitsLeft;
              n = buffer >>> bitPos & bitMask;
              buffer = src[i++];
              bitsLeft = 32 - missingBits;
              n |= (buffer & (1 << missingBits) - 1) << bitsPerPixel - missingBits;
              bitPos = missingBits;
            }
            dest[o] = n < nmax ? offset + n * scale : maxValue;
          }
          dest.unshift(offset);
          return dest;
        },
        originalUnstuff: function(src, dest, bitsPerPixel, numPixels) {
          var bitMask = (1 << bitsPerPixel) - 1;
          var i = 0, o;
          var bitsLeft = 0;
          var n, buffer, missingBits;
          var numInvalidTailBytes = src.length * 4 - Math.ceil(bitsPerPixel * numPixels / 8);
          src[src.length - 1] <<= 8 * numInvalidTailBytes;
          for (o = 0; o < numPixels; o++) {
            if (bitsLeft === 0) {
              buffer = src[i++];
              bitsLeft = 32;
            }
            if (bitsLeft >= bitsPerPixel) {
              n = buffer >>> bitsLeft - bitsPerPixel & bitMask;
              bitsLeft -= bitsPerPixel;
            } else {
              missingBits = bitsPerPixel - bitsLeft;
              n = (buffer & bitMask) << missingBits & bitMask;
              buffer = src[i++];
              bitsLeft = 32 - missingBits;
              n += buffer >>> bitsLeft;
            }
            dest[o] = n;
          }
          return dest;
        },
        originalUnstuff2: function(src, dest, bitsPerPixel, numPixels) {
          var bitMask = (1 << bitsPerPixel) - 1;
          var i = 0, o;
          var bitsLeft = 0, bitPos = 0;
          var n, buffer, missingBits;
          for (o = 0; o < numPixels; o++) {
            if (bitsLeft === 0) {
              buffer = src[i++];
              bitsLeft = 32;
              bitPos = 0;
            }
            if (bitsLeft >= bitsPerPixel) {
              n = buffer >>> bitPos & bitMask;
              bitsLeft -= bitsPerPixel;
              bitPos += bitsPerPixel;
            } else {
              missingBits = bitsPerPixel - bitsLeft;
              n = buffer >>> bitPos & bitMask;
              buffer = src[i++];
              bitsLeft = 32 - missingBits;
              n |= (buffer & (1 << missingBits) - 1) << bitsPerPixel - missingBits;
              bitPos = missingBits;
            }
            dest[o] = n;
          }
          return dest;
        }
      };
      var Lerc2Helpers = {
        HUFFMAN_LUT_BITS_MAX: 12,
        //use 2^12 lut, treat it like constant
        computeChecksumFletcher32: function(input) {
          var sum1 = 65535, sum2 = 65535;
          var len = input.length;
          var words = Math.floor(len / 2);
          var i = 0;
          while (words) {
            var tlen = words >= 359 ? 359 : words;
            words -= tlen;
            do {
              sum1 += input[i++] << 8;
              sum2 += sum1 += input[i++];
            } while (--tlen);
            sum1 = (sum1 & 65535) + (sum1 >>> 16);
            sum2 = (sum2 & 65535) + (sum2 >>> 16);
          }
          if (len & 1) {
            sum2 += sum1 += input[i] << 8;
          }
          sum1 = (sum1 & 65535) + (sum1 >>> 16);
          sum2 = (sum2 & 65535) + (sum2 >>> 16);
          return (sum2 << 16 | sum1) >>> 0;
        },
        readHeaderInfo: function(input, data) {
          var ptr = data.ptr;
          var fileIdView = new Uint8Array(input, ptr, 6);
          var headerInfo = {};
          headerInfo.fileIdentifierString = String.fromCharCode.apply(null, fileIdView);
          if (headerInfo.fileIdentifierString.lastIndexOf("Lerc2", 0) !== 0) {
            throw "Unexpected file identifier string (expect Lerc2 ): " + headerInfo.fileIdentifierString;
          }
          ptr += 6;
          var view = new DataView(input, ptr, 8);
          var fileVersion = view.getInt32(0, true);
          headerInfo.fileVersion = fileVersion;
          ptr += 4;
          if (fileVersion >= 3) {
            headerInfo.checksum = view.getUint32(4, true);
            ptr += 4;
          }
          view = new DataView(input, ptr, 12);
          headerInfo.height = view.getUint32(0, true);
          headerInfo.width = view.getUint32(4, true);
          ptr += 8;
          if (fileVersion >= 4) {
            headerInfo.numDims = view.getUint32(8, true);
            ptr += 4;
          } else {
            headerInfo.numDims = 1;
          }
          view = new DataView(input, ptr, 40);
          headerInfo.numValidPixel = view.getUint32(0, true);
          headerInfo.microBlockSize = view.getInt32(4, true);
          headerInfo.blobSize = view.getInt32(8, true);
          headerInfo.imageType = view.getInt32(12, true);
          headerInfo.maxZError = view.getFloat64(16, true);
          headerInfo.zMin = view.getFloat64(24, true);
          headerInfo.zMax = view.getFloat64(32, true);
          ptr += 40;
          data.headerInfo = headerInfo;
          data.ptr = ptr;
          var checksum, keyLength;
          if (fileVersion >= 3) {
            keyLength = fileVersion >= 4 ? 52 : 48;
            checksum = this.computeChecksumFletcher32(new Uint8Array(input, ptr - keyLength, headerInfo.blobSize - 14));
            if (checksum !== headerInfo.checksum) {
              throw "Checksum failed.";
            }
          }
          return true;
        },
        checkMinMaxRanges: function(input, data) {
          var headerInfo = data.headerInfo;
          var OutPixelTypeArray = this.getDataTypeArray(headerInfo.imageType);
          var rangeBytes = headerInfo.numDims * this.getDataTypeSize(headerInfo.imageType);
          var minValues = this.readSubArray(input, data.ptr, OutPixelTypeArray, rangeBytes);
          var maxValues = this.readSubArray(input, data.ptr + rangeBytes, OutPixelTypeArray, rangeBytes);
          data.ptr += 2 * rangeBytes;
          var i, equal = true;
          for (i = 0; i < headerInfo.numDims; i++) {
            if (minValues[i] !== maxValues[i]) {
              equal = false;
              break;
            }
          }
          headerInfo.minValues = minValues;
          headerInfo.maxValues = maxValues;
          return equal;
        },
        readSubArray: function(input, ptr, OutPixelTypeArray, numBytes) {
          var rawData;
          if (OutPixelTypeArray === Uint8Array) {
            rawData = new Uint8Array(input, ptr, numBytes);
          } else {
            var arrayBuf = new ArrayBuffer(numBytes);
            var store8 = new Uint8Array(arrayBuf);
            store8.set(new Uint8Array(input, ptr, numBytes));
            rawData = new OutPixelTypeArray(arrayBuf);
          }
          return rawData;
        },
        readMask: function(input, data) {
          var ptr = data.ptr;
          var headerInfo = data.headerInfo;
          var numPixels = headerInfo.width * headerInfo.height;
          var numValidPixel = headerInfo.numValidPixel;
          var view = new DataView(input, ptr, 4);
          var mask = {};
          mask.numBytes = view.getUint32(0, true);
          ptr += 4;
          if ((0 === numValidPixel || numPixels === numValidPixel) && 0 !== mask.numBytes) {
            throw "invalid mask";
          }
          var bitset, resultMask;
          if (numValidPixel === 0) {
            bitset = new Uint8Array(Math.ceil(numPixels / 8));
            mask.bitset = bitset;
            resultMask = new Uint8Array(numPixels);
            data.pixels.resultMask = resultMask;
            ptr += mask.numBytes;
          } else if (mask.numBytes > 0) {
            bitset = new Uint8Array(Math.ceil(numPixels / 8));
            view = new DataView(input, ptr, mask.numBytes);
            var cnt = view.getInt16(0, true);
            var ip = 2, op = 0, val = 0;
            do {
              if (cnt > 0) {
                while (cnt--) {
                  bitset[op++] = view.getUint8(ip++);
                }
              } else {
                val = view.getUint8(ip++);
                cnt = -cnt;
                while (cnt--) {
                  bitset[op++] = val;
                }
              }
              cnt = view.getInt16(ip, true);
              ip += 2;
            } while (ip < mask.numBytes);
            if (cnt !== -32768 || op < bitset.length) {
              throw "Unexpected end of mask RLE encoding";
            }
            resultMask = new Uint8Array(numPixels);
            var mb = 0, k = 0;
            for (k = 0; k < numPixels; k++) {
              if (k & 7) {
                mb = bitset[k >> 3];
                mb <<= k & 7;
              } else {
                mb = bitset[k >> 3];
              }
              if (mb & 128) {
                resultMask[k] = 1;
              }
            }
            data.pixels.resultMask = resultMask;
            mask.bitset = bitset;
            ptr += mask.numBytes;
          }
          data.ptr = ptr;
          data.mask = mask;
          return true;
        },
        readDataOneSweep: function(input, data, OutPixelTypeArray, useBSQForOutputDim) {
          var ptr = data.ptr;
          var headerInfo = data.headerInfo;
          var numDims = headerInfo.numDims;
          var numPixels = headerInfo.width * headerInfo.height;
          var imageType = headerInfo.imageType;
          var numBytes = headerInfo.numValidPixel * Lerc2Helpers.getDataTypeSize(imageType) * numDims;
          var rawData;
          var mask = data.pixels.resultMask;
          if (OutPixelTypeArray === Uint8Array) {
            rawData = new Uint8Array(input, ptr, numBytes);
          } else {
            var arrayBuf = new ArrayBuffer(numBytes);
            var store8 = new Uint8Array(arrayBuf);
            store8.set(new Uint8Array(input, ptr, numBytes));
            rawData = new OutPixelTypeArray(arrayBuf);
          }
          if (rawData.length === numPixels * numDims) {
            if (useBSQForOutputDim) {
              data.pixels.resultPixels = Lerc2Helpers.swapDimensionOrder(rawData, numPixels, numDims, OutPixelTypeArray, true);
            } else {
              data.pixels.resultPixels = rawData;
            }
          } else {
            data.pixels.resultPixels = new OutPixelTypeArray(numPixels * numDims);
            var z = 0, k = 0, i = 0, nStart = 0;
            if (numDims > 1) {
              if (useBSQForOutputDim) {
                for (k = 0; k < numPixels; k++) {
                  if (mask[k]) {
                    nStart = k;
                    for (i = 0; i < numDims; i++, nStart += numPixels) {
                      data.pixels.resultPixels[nStart] = rawData[z++];
                    }
                  }
                }
              } else {
                for (k = 0; k < numPixels; k++) {
                  if (mask[k]) {
                    nStart = k * numDims;
                    for (i = 0; i < numDims; i++) {
                      data.pixels.resultPixels[nStart + i] = rawData[z++];
                    }
                  }
                }
              }
            } else {
              for (k = 0; k < numPixels; k++) {
                if (mask[k]) {
                  data.pixels.resultPixels[k] = rawData[z++];
                }
              }
            }
          }
          ptr += numBytes;
          data.ptr = ptr;
          return true;
        },
        readHuffmanTree: function(input, data) {
          var BITS_MAX = this.HUFFMAN_LUT_BITS_MAX;
          var view = new DataView(input, data.ptr, 16);
          data.ptr += 16;
          var version = view.getInt32(0, true);
          if (version < 2) {
            throw "unsupported Huffman version";
          }
          var size = view.getInt32(4, true);
          var i0 = view.getInt32(8, true);
          var i1 = view.getInt32(12, true);
          if (i0 >= i1) {
            return false;
          }
          var blockDataBuffer = new Uint32Array(i1 - i0);
          Lerc2Helpers.decodeBits(input, data, blockDataBuffer);
          var codeTable = [];
          var i, j, k, len;
          for (i = i0; i < i1; i++) {
            j = i - (i < size ? 0 : size);
            codeTable[j] = { first: blockDataBuffer[i - i0], second: null };
          }
          var dataBytes = input.byteLength - data.ptr;
          var dataWords = Math.ceil(dataBytes / 4);
          var arrayBuf = new ArrayBuffer(dataWords * 4);
          var store8 = new Uint8Array(arrayBuf);
          store8.set(new Uint8Array(input, data.ptr, dataBytes));
          var stuffedData = new Uint32Array(arrayBuf);
          var bitPos = 0, word, srcPtr = 0;
          word = stuffedData[0];
          for (i = i0; i < i1; i++) {
            j = i - (i < size ? 0 : size);
            len = codeTable[j].first;
            if (len > 0) {
              codeTable[j].second = word << bitPos >>> 32 - len;
              if (32 - bitPos >= len) {
                bitPos += len;
                if (bitPos === 32) {
                  bitPos = 0;
                  srcPtr++;
                  word = stuffedData[srcPtr];
                }
              } else {
                bitPos += len - 32;
                srcPtr++;
                word = stuffedData[srcPtr];
                codeTable[j].second |= word >>> 32 - bitPos;
              }
            }
          }
          var numBitsLUT = 0, numBitsLUTQick = 0;
          var tree = new TreeNode();
          for (i = 0; i < codeTable.length; i++) {
            if (codeTable[i] !== void 0) {
              numBitsLUT = Math.max(numBitsLUT, codeTable[i].first);
            }
          }
          if (numBitsLUT >= BITS_MAX) {
            numBitsLUTQick = BITS_MAX;
          } else {
            numBitsLUTQick = numBitsLUT;
          }
          var decodeLut = [], entry, code, numEntries, jj, currentBit, node;
          for (i = i0; i < i1; i++) {
            j = i - (i < size ? 0 : size);
            len = codeTable[j].first;
            if (len > 0) {
              entry = [len, j];
              if (len <= numBitsLUTQick) {
                code = codeTable[j].second << numBitsLUTQick - len;
                numEntries = 1 << numBitsLUTQick - len;
                for (k = 0; k < numEntries; k++) {
                  decodeLut[code | k] = entry;
                }
              } else {
                code = codeTable[j].second;
                node = tree;
                for (jj = len - 1; jj >= 0; jj--) {
                  currentBit = code >>> jj & 1;
                  if (currentBit) {
                    if (!node.right) {
                      node.right = new TreeNode();
                    }
                    node = node.right;
                  } else {
                    if (!node.left) {
                      node.left = new TreeNode();
                    }
                    node = node.left;
                  }
                  if (jj === 0 && !node.val) {
                    node.val = entry[1];
                  }
                }
              }
            }
          }
          return {
            decodeLut,
            numBitsLUTQick,
            numBitsLUT,
            tree,
            stuffedData,
            srcPtr,
            bitPos
          };
        },
        readHuffman: function(input, data, OutPixelTypeArray, useBSQForOutputDim) {
          var headerInfo = data.headerInfo;
          var numDims = headerInfo.numDims;
          var height = data.headerInfo.height;
          var width = data.headerInfo.width;
          var numPixels = width * height;
          var huffmanInfo = this.readHuffmanTree(input, data);
          var decodeLut = huffmanInfo.decodeLut;
          var tree = huffmanInfo.tree;
          var stuffedData = huffmanInfo.stuffedData;
          var srcPtr = huffmanInfo.srcPtr;
          var bitPos = huffmanInfo.bitPos;
          var numBitsLUTQick = huffmanInfo.numBitsLUTQick;
          var numBitsLUT = huffmanInfo.numBitsLUT;
          var offset = data.headerInfo.imageType === 0 ? 128 : 0;
          var node, val, delta, mask = data.pixels.resultMask, valTmp, valTmpQuick, currentBit;
          var i, j, k, ii;
          var prevVal = 0;
          if (bitPos > 0) {
            srcPtr++;
            bitPos = 0;
          }
          var word = stuffedData[srcPtr];
          var deltaEncode = data.encodeMode === 1;
          var resultPixelsAllDim = new OutPixelTypeArray(numPixels * numDims);
          var resultPixels = resultPixelsAllDim;
          var iDim;
          if (numDims < 2 || deltaEncode) {
            for (iDim = 0; iDim < numDims; iDim++) {
              if (numDims > 1) {
                resultPixels = new OutPixelTypeArray(resultPixelsAllDim.buffer, numPixels * iDim, numPixels);
                prevVal = 0;
              }
              if (data.headerInfo.numValidPixel === width * height) {
                for (k = 0, i = 0; i < height; i++) {
                  for (j = 0; j < width; j++, k++) {
                    val = 0;
                    valTmp = word << bitPos >>> 32 - numBitsLUTQick;
                    valTmpQuick = valTmp;
                    if (32 - bitPos < numBitsLUTQick) {
                      valTmp |= stuffedData[srcPtr + 1] >>> 64 - bitPos - numBitsLUTQick;
                      valTmpQuick = valTmp;
                    }
                    if (decodeLut[valTmpQuick]) {
                      val = decodeLut[valTmpQuick][1];
                      bitPos += decodeLut[valTmpQuick][0];
                    } else {
                      valTmp = word << bitPos >>> 32 - numBitsLUT;
                      valTmpQuick = valTmp;
                      if (32 - bitPos < numBitsLUT) {
                        valTmp |= stuffedData[srcPtr + 1] >>> 64 - bitPos - numBitsLUT;
                        valTmpQuick = valTmp;
                      }
                      node = tree;
                      for (ii = 0; ii < numBitsLUT; ii++) {
                        currentBit = valTmp >>> numBitsLUT - ii - 1 & 1;
                        node = currentBit ? node.right : node.left;
                        if (!(node.left || node.right)) {
                          val = node.val;
                          bitPos = bitPos + ii + 1;
                          break;
                        }
                      }
                    }
                    if (bitPos >= 32) {
                      bitPos -= 32;
                      srcPtr++;
                      word = stuffedData[srcPtr];
                    }
                    delta = val - offset;
                    if (deltaEncode) {
                      if (j > 0) {
                        delta += prevVal;
                      } else if (i > 0) {
                        delta += resultPixels[k - width];
                      } else {
                        delta += prevVal;
                      }
                      delta &= 255;
                      resultPixels[k] = delta;
                      prevVal = delta;
                    } else {
                      resultPixels[k] = delta;
                    }
                  }
                }
              } else {
                for (k = 0, i = 0; i < height; i++) {
                  for (j = 0; j < width; j++, k++) {
                    if (mask[k]) {
                      val = 0;
                      valTmp = word << bitPos >>> 32 - numBitsLUTQick;
                      valTmpQuick = valTmp;
                      if (32 - bitPos < numBitsLUTQick) {
                        valTmp |= stuffedData[srcPtr + 1] >>> 64 - bitPos - numBitsLUTQick;
                        valTmpQuick = valTmp;
                      }
                      if (decodeLut[valTmpQuick]) {
                        val = decodeLut[valTmpQuick][1];
                        bitPos += decodeLut[valTmpQuick][0];
                      } else {
                        valTmp = word << bitPos >>> 32 - numBitsLUT;
                        valTmpQuick = valTmp;
                        if (32 - bitPos < numBitsLUT) {
                          valTmp |= stuffedData[srcPtr + 1] >>> 64 - bitPos - numBitsLUT;
                          valTmpQuick = valTmp;
                        }
                        node = tree;
                        for (ii = 0; ii < numBitsLUT; ii++) {
                          currentBit = valTmp >>> numBitsLUT - ii - 1 & 1;
                          node = currentBit ? node.right : node.left;
                          if (!(node.left || node.right)) {
                            val = node.val;
                            bitPos = bitPos + ii + 1;
                            break;
                          }
                        }
                      }
                      if (bitPos >= 32) {
                        bitPos -= 32;
                        srcPtr++;
                        word = stuffedData[srcPtr];
                      }
                      delta = val - offset;
                      if (deltaEncode) {
                        if (j > 0 && mask[k - 1]) {
                          delta += prevVal;
                        } else if (i > 0 && mask[k - width]) {
                          delta += resultPixels[k - width];
                        } else {
                          delta += prevVal;
                        }
                        delta &= 255;
                        resultPixels[k] = delta;
                        prevVal = delta;
                      } else {
                        resultPixels[k] = delta;
                      }
                    }
                  }
                }
              }
            }
          } else {
            for (k = 0, i = 0; i < height; i++) {
              for (j = 0; j < width; j++) {
                k = i * width + j;
                if (!mask || mask[k]) {
                  for (iDim = 0; iDim < numDims; iDim++, k += numPixels) {
                    val = 0;
                    valTmp = word << bitPos >>> 32 - numBitsLUTQick;
                    valTmpQuick = valTmp;
                    if (32 - bitPos < numBitsLUTQick) {
                      valTmp |= stuffedData[srcPtr + 1] >>> 64 - bitPos - numBitsLUTQick;
                      valTmpQuick = valTmp;
                    }
                    if (decodeLut[valTmpQuick]) {
                      val = decodeLut[valTmpQuick][1];
                      bitPos += decodeLut[valTmpQuick][0];
                    } else {
                      valTmp = word << bitPos >>> 32 - numBitsLUT;
                      valTmpQuick = valTmp;
                      if (32 - bitPos < numBitsLUT) {
                        valTmp |= stuffedData[srcPtr + 1] >>> 64 - bitPos - numBitsLUT;
                        valTmpQuick = valTmp;
                      }
                      node = tree;
                      for (ii = 0; ii < numBitsLUT; ii++) {
                        currentBit = valTmp >>> numBitsLUT - ii - 1 & 1;
                        node = currentBit ? node.right : node.left;
                        if (!(node.left || node.right)) {
                          val = node.val;
                          bitPos = bitPos + ii + 1;
                          break;
                        }
                      }
                    }
                    if (bitPos >= 32) {
                      bitPos -= 32;
                      srcPtr++;
                      word = stuffedData[srcPtr];
                    }
                    delta = val - offset;
                    resultPixels[k] = delta;
                  }
                }
              }
            }
          }
          data.ptr = data.ptr + (srcPtr + 1) * 4 + (bitPos > 0 ? 4 : 0);
          data.pixels.resultPixels = resultPixelsAllDim;
          if (numDims > 1 && !useBSQForOutputDim) {
            data.pixels.resultPixels = Lerc2Helpers.swapDimensionOrder(resultPixelsAllDim, numPixels, numDims, OutPixelTypeArray);
          }
        },
        decodeBits: function(input, data, blockDataBuffer, offset, iDim) {
          {
            var headerInfo = data.headerInfo;
            var fileVersion = headerInfo.fileVersion;
            var blockPtr = 0;
            var viewByteLength = input.byteLength - data.ptr >= 5 ? 5 : input.byteLength - data.ptr;
            var view = new DataView(input, data.ptr, viewByteLength);
            var headerByte = view.getUint8(0);
            blockPtr++;
            var bits67 = headerByte >> 6;
            var n = bits67 === 0 ? 4 : 3 - bits67;
            var doLut = (headerByte & 32) > 0 ? true : false;
            var numBits = headerByte & 31;
            var numElements = 0;
            if (n === 1) {
              numElements = view.getUint8(blockPtr);
              blockPtr++;
            } else if (n === 2) {
              numElements = view.getUint16(blockPtr, true);
              blockPtr += 2;
            } else if (n === 4) {
              numElements = view.getUint32(blockPtr, true);
              blockPtr += 4;
            } else {
              throw "Invalid valid pixel count type";
            }
            var scale = 2 * headerInfo.maxZError;
            var stuffedData, arrayBuf, store8, dataBytes, dataWords;
            var lutArr, lutData, lutBytes, bitsPerPixel;
            var zMax = headerInfo.numDims > 1 ? headerInfo.maxValues[iDim] : headerInfo.zMax;
            if (doLut) {
              data.counter.lut++;
              lutBytes = view.getUint8(blockPtr);
              blockPtr++;
              dataBytes = Math.ceil((lutBytes - 1) * numBits / 8);
              dataWords = Math.ceil(dataBytes / 4);
              arrayBuf = new ArrayBuffer(dataWords * 4);
              store8 = new Uint8Array(arrayBuf);
              data.ptr += blockPtr;
              store8.set(new Uint8Array(input, data.ptr, dataBytes));
              lutData = new Uint32Array(arrayBuf);
              data.ptr += dataBytes;
              bitsPerPixel = 0;
              while (lutBytes - 1 >>> bitsPerPixel) {
                bitsPerPixel++;
              }
              dataBytes = Math.ceil(numElements * bitsPerPixel / 8);
              dataWords = Math.ceil(dataBytes / 4);
              arrayBuf = new ArrayBuffer(dataWords * 4);
              store8 = new Uint8Array(arrayBuf);
              store8.set(new Uint8Array(input, data.ptr, dataBytes));
              stuffedData = new Uint32Array(arrayBuf);
              data.ptr += dataBytes;
              if (fileVersion >= 3) {
                lutArr = BitStuffer.unstuffLUT2(lutData, numBits, lutBytes - 1, offset, scale, zMax);
              } else {
                lutArr = BitStuffer.unstuffLUT(lutData, numBits, lutBytes - 1, offset, scale, zMax);
              }
              if (fileVersion >= 3) {
                BitStuffer.unstuff2(stuffedData, blockDataBuffer, bitsPerPixel, numElements, lutArr);
              } else {
                BitStuffer.unstuff(stuffedData, blockDataBuffer, bitsPerPixel, numElements, lutArr);
              }
            } else {
              data.counter.bitstuffer++;
              bitsPerPixel = numBits;
              data.ptr += blockPtr;
              if (bitsPerPixel > 0) {
                dataBytes = Math.ceil(numElements * bitsPerPixel / 8);
                dataWords = Math.ceil(dataBytes / 4);
                arrayBuf = new ArrayBuffer(dataWords * 4);
                store8 = new Uint8Array(arrayBuf);
                store8.set(new Uint8Array(input, data.ptr, dataBytes));
                stuffedData = new Uint32Array(arrayBuf);
                data.ptr += dataBytes;
                if (fileVersion >= 3) {
                  if (offset == null) {
                    BitStuffer.originalUnstuff2(stuffedData, blockDataBuffer, bitsPerPixel, numElements);
                  } else {
                    BitStuffer.unstuff2(stuffedData, blockDataBuffer, bitsPerPixel, numElements, false, offset, scale, zMax);
                  }
                } else {
                  if (offset == null) {
                    BitStuffer.originalUnstuff(stuffedData, blockDataBuffer, bitsPerPixel, numElements);
                  } else {
                    BitStuffer.unstuff(stuffedData, blockDataBuffer, bitsPerPixel, numElements, false, offset, scale, zMax);
                  }
                }
              }
            }
          }
        },
        readTiles: function(input, data, OutPixelTypeArray, useBSQForOutputDim) {
          var headerInfo = data.headerInfo;
          var width = headerInfo.width;
          var height = headerInfo.height;
          var numPixels = width * height;
          var microBlockSize = headerInfo.microBlockSize;
          var imageType = headerInfo.imageType;
          var dataTypeSize = Lerc2Helpers.getDataTypeSize(imageType);
          var numBlocksX = Math.ceil(width / microBlockSize);
          var numBlocksY = Math.ceil(height / microBlockSize);
          data.pixels.numBlocksY = numBlocksY;
          data.pixels.numBlocksX = numBlocksX;
          data.pixels.ptr = 0;
          var row = 0, col = 0, blockY = 0, blockX = 0, thisBlockHeight = 0, thisBlockWidth = 0, bytesLeft = 0, headerByte = 0, bits67 = 0, testCode = 0, outPtr = 0, outStride = 0, numBytes = 0, bytesleft = 0, z = 0, blockPtr = 0;
          var view, block, arrayBuf, store8, rawData;
          var blockEncoding;
          var blockDataBuffer = new OutPixelTypeArray(microBlockSize * microBlockSize);
          var lastBlockHeight = height % microBlockSize || microBlockSize;
          var lastBlockWidth = width % microBlockSize || microBlockSize;
          var offsetType, offset;
          var numDims = headerInfo.numDims, iDim;
          var mask = data.pixels.resultMask;
          var resultPixels = data.pixels.resultPixels;
          var fileVersion = headerInfo.fileVersion;
          var fileVersionCheckNum = fileVersion >= 5 ? 14 : 15;
          var isDiffEncoding;
          var zMax = headerInfo.zMax;
          var resultPixelsPrevDim;
          for (blockY = 0; blockY < numBlocksY; blockY++) {
            thisBlockHeight = blockY !== numBlocksY - 1 ? microBlockSize : lastBlockHeight;
            for (blockX = 0; blockX < numBlocksX; blockX++) {
              thisBlockWidth = blockX !== numBlocksX - 1 ? microBlockSize : lastBlockWidth;
              outPtr = blockY * width * microBlockSize + blockX * microBlockSize;
              outStride = width - thisBlockWidth;
              for (iDim = 0; iDim < numDims; iDim++) {
                if (numDims > 1) {
                  resultPixelsPrevDim = resultPixels;
                  outPtr = blockY * width * microBlockSize + blockX * microBlockSize;
                  resultPixels = new OutPixelTypeArray(data.pixels.resultPixels.buffer, numPixels * iDim * dataTypeSize, numPixels);
                  zMax = headerInfo.maxValues[iDim];
                } else {
                  resultPixelsPrevDim = null;
                }
                bytesLeft = input.byteLength - data.ptr;
                view = new DataView(input, data.ptr, Math.min(10, bytesLeft));
                block = {};
                blockPtr = 0;
                headerByte = view.getUint8(0);
                blockPtr++;
                isDiffEncoding = headerInfo.fileVersion >= 5 ? headerByte & 4 : 0;
                bits67 = headerByte >> 6 & 255;
                testCode = headerByte >> 2 & fileVersionCheckNum;
                if (testCode !== (blockX * microBlockSize >> 3 & fileVersionCheckNum)) {
                  throw "integrity issue";
                }
                if (isDiffEncoding && iDim === 0) {
                  throw "integrity issue";
                }
                blockEncoding = headerByte & 3;
                if (blockEncoding > 3) {
                  data.ptr += blockPtr;
                  throw "Invalid block encoding (" + blockEncoding + ")";
                } else if (blockEncoding === 2) {
                  if (isDiffEncoding) {
                    if (mask) {
                      for (row = 0; row < thisBlockHeight; row++) {
                        for (col = 0; col < thisBlockWidth; col++) {
                          if (mask[outPtr]) {
                            resultPixels[outPtr] = resultPixelsPrevDim[outPtr];
                          }
                          outPtr++;
                        }
                      }
                    } else {
                      for (row = 0; row < thisBlockHeight; row++) {
                        for (col = 0; col < thisBlockWidth; col++) {
                          resultPixels[outPtr] = resultPixelsPrevDim[outPtr];
                          outPtr++;
                        }
                      }
                    }
                  }
                  data.counter.constant++;
                  data.ptr += blockPtr;
                  continue;
                } else if (blockEncoding === 0) {
                  if (isDiffEncoding) {
                    throw "integrity issue";
                  }
                  data.counter.uncompressed++;
                  data.ptr += blockPtr;
                  numBytes = thisBlockHeight * thisBlockWidth * dataTypeSize;
                  bytesleft = input.byteLength - data.ptr;
                  numBytes = numBytes < bytesleft ? numBytes : bytesleft;
                  arrayBuf = new ArrayBuffer(numBytes % dataTypeSize === 0 ? numBytes : numBytes + dataTypeSize - numBytes % dataTypeSize);
                  store8 = new Uint8Array(arrayBuf);
                  store8.set(new Uint8Array(input, data.ptr, numBytes));
                  rawData = new OutPixelTypeArray(arrayBuf);
                  z = 0;
                  if (mask) {
                    for (row = 0; row < thisBlockHeight; row++) {
                      for (col = 0; col < thisBlockWidth; col++) {
                        if (mask[outPtr]) {
                          resultPixels[outPtr] = rawData[z++];
                        }
                        outPtr++;
                      }
                      outPtr += outStride;
                    }
                  } else {
                    for (row = 0; row < thisBlockHeight; row++) {
                      for (col = 0; col < thisBlockWidth; col++) {
                        resultPixels[outPtr++] = rawData[z++];
                      }
                      outPtr += outStride;
                    }
                  }
                  data.ptr += z * dataTypeSize;
                } else {
                  offsetType = Lerc2Helpers.getDataTypeUsed(isDiffEncoding && imageType < 6 ? 4 : imageType, bits67);
                  offset = Lerc2Helpers.getOnePixel(block, blockPtr, offsetType, view);
                  blockPtr += Lerc2Helpers.getDataTypeSize(offsetType);
                  if (blockEncoding === 3) {
                    data.ptr += blockPtr;
                    data.counter.constantoffset++;
                    if (mask) {
                      for (row = 0; row < thisBlockHeight; row++) {
                        for (col = 0; col < thisBlockWidth; col++) {
                          if (mask[outPtr]) {
                            resultPixels[outPtr] = isDiffEncoding ? Math.min(zMax, resultPixelsPrevDim[outPtr] + offset) : offset;
                          }
                          outPtr++;
                        }
                        outPtr += outStride;
                      }
                    } else {
                      for (row = 0; row < thisBlockHeight; row++) {
                        for (col = 0; col < thisBlockWidth; col++) {
                          resultPixels[outPtr] = isDiffEncoding ? Math.min(zMax, resultPixelsPrevDim[outPtr] + offset) : offset;
                          outPtr++;
                        }
                        outPtr += outStride;
                      }
                    }
                  } else {
                    data.ptr += blockPtr;
                    Lerc2Helpers.decodeBits(input, data, blockDataBuffer, offset, iDim);
                    blockPtr = 0;
                    if (isDiffEncoding) {
                      if (mask) {
                        for (row = 0; row < thisBlockHeight; row++) {
                          for (col = 0; col < thisBlockWidth; col++) {
                            if (mask[outPtr]) {
                              resultPixels[outPtr] = blockDataBuffer[blockPtr++] + resultPixelsPrevDim[outPtr];
                            }
                            outPtr++;
                          }
                          outPtr += outStride;
                        }
                      } else {
                        for (row = 0; row < thisBlockHeight; row++) {
                          for (col = 0; col < thisBlockWidth; col++) {
                            resultPixels[outPtr] = blockDataBuffer[blockPtr++] + resultPixelsPrevDim[outPtr];
                            outPtr++;
                          }
                          outPtr += outStride;
                        }
                      }
                    } else if (mask) {
                      for (row = 0; row < thisBlockHeight; row++) {
                        for (col = 0; col < thisBlockWidth; col++) {
                          if (mask[outPtr]) {
                            resultPixels[outPtr] = blockDataBuffer[blockPtr++];
                          }
                          outPtr++;
                        }
                        outPtr += outStride;
                      }
                    } else {
                      for (row = 0; row < thisBlockHeight; row++) {
                        for (col = 0; col < thisBlockWidth; col++) {
                          resultPixels[outPtr++] = blockDataBuffer[blockPtr++];
                        }
                        outPtr += outStride;
                      }
                    }
                  }
                }
              }
            }
          }
          if (numDims > 1 && !useBSQForOutputDim) {
            data.pixels.resultPixels = Lerc2Helpers.swapDimensionOrder(data.pixels.resultPixels, numPixels, numDims, OutPixelTypeArray);
          }
        },
        /*****************
        *  private methods (helper methods)
        *****************/
        formatFileInfo: function(data) {
          return {
            "fileIdentifierString": data.headerInfo.fileIdentifierString,
            "fileVersion": data.headerInfo.fileVersion,
            "imageType": data.headerInfo.imageType,
            "height": data.headerInfo.height,
            "width": data.headerInfo.width,
            "numValidPixel": data.headerInfo.numValidPixel,
            "microBlockSize": data.headerInfo.microBlockSize,
            "blobSize": data.headerInfo.blobSize,
            "maxZError": data.headerInfo.maxZError,
            "pixelType": Lerc2Helpers.getPixelType(data.headerInfo.imageType),
            "eofOffset": data.eofOffset,
            "mask": data.mask ? {
              "numBytes": data.mask.numBytes
            } : null,
            "pixels": {
              "numBlocksX": data.pixels.numBlocksX,
              "numBlocksY": data.pixels.numBlocksY,
              //"numBytes": data.pixels.numBytes,
              "maxValue": data.headerInfo.zMax,
              "minValue": data.headerInfo.zMin,
              "noDataValue": data.noDataValue
            }
          };
        },
        constructConstantSurface: function(data, useBSQForOutputDim) {
          var val = data.headerInfo.zMax;
          var valMin = data.headerInfo.zMin;
          var maxValues = data.headerInfo.maxValues;
          var numDims = data.headerInfo.numDims;
          var numPixels = data.headerInfo.height * data.headerInfo.width;
          var i = 0, k = 0, nStart = 0;
          var mask = data.pixels.resultMask;
          var resultPixels = data.pixels.resultPixels;
          if (mask) {
            if (numDims > 1) {
              if (useBSQForOutputDim) {
                for (i = 0; i < numDims; i++) {
                  nStart = i * numPixels;
                  val = maxValues[i];
                  for (k = 0; k < numPixels; k++) {
                    if (mask[k]) {
                      resultPixels[nStart + k] = val;
                    }
                  }
                }
              } else {
                for (k = 0; k < numPixels; k++) {
                  if (mask[k]) {
                    nStart = k * numDims;
                    for (i = 0; i < numDims; i++) {
                      resultPixels[nStart + numDims] = maxValues[i];
                    }
                  }
                }
              }
            } else {
              for (k = 0; k < numPixels; k++) {
                if (mask[k]) {
                  resultPixels[k] = val;
                }
              }
            }
          } else {
            if (numDims > 1 && valMin !== val) {
              if (useBSQForOutputDim) {
                for (i = 0; i < numDims; i++) {
                  nStart = i * numPixels;
                  val = maxValues[i];
                  for (k = 0; k < numPixels; k++) {
                    resultPixels[nStart + k] = val;
                  }
                }
              } else {
                for (k = 0; k < numPixels; k++) {
                  nStart = k * numDims;
                  for (i = 0; i < numDims; i++) {
                    resultPixels[nStart + i] = maxValues[i];
                  }
                }
              }
            } else {
              for (k = 0; k < numPixels * numDims; k++) {
                resultPixels[k] = val;
              }
            }
          }
          return;
        },
        getDataTypeArray: function(t) {
          var tp;
          switch (t) {
            case 0:
              tp = Int8Array;
              break;
            case 1:
              tp = Uint8Array;
              break;
            case 2:
              tp = Int16Array;
              break;
            case 3:
              tp = Uint16Array;
              break;
            case 4:
              tp = Int32Array;
              break;
            case 5:
              tp = Uint32Array;
              break;
            case 6:
              tp = Float32Array;
              break;
            case 7:
              tp = Float64Array;
              break;
            default:
              tp = Float32Array;
          }
          return tp;
        },
        getPixelType: function(t) {
          var tp;
          switch (t) {
            case 0:
              tp = "S8";
              break;
            case 1:
              tp = "U8";
              break;
            case 2:
              tp = "S16";
              break;
            case 3:
              tp = "U16";
              break;
            case 4:
              tp = "S32";
              break;
            case 5:
              tp = "U32";
              break;
            case 6:
              tp = "F32";
              break;
            case 7:
              tp = "F64";
              break;
            default:
              tp = "F32";
          }
          return tp;
        },
        isValidPixelValue: function(t, val) {
          if (val == null) {
            return false;
          }
          var isValid;
          switch (t) {
            case 0:
              isValid = val >= -128 && val <= 127;
              break;
            case 1:
              isValid = val >= 0 && val <= 255;
              break;
            case 2:
              isValid = val >= -32768 && val <= 32767;
              break;
            case 3:
              isValid = val >= 0 && val <= 65536;
              break;
            case 4:
              isValid = val >= -2147483648 && val <= 2147483647;
              break;
            case 5:
              isValid = val >= 0 && val <= 4294967296;
              break;
            case 6:
              isValid = val >= -34027999387901484e22 && val <= 34027999387901484e22;
              break;
            case 7:
              isValid = val >= -17976931348623157e292 && val <= 17976931348623157e292;
              break;
            default:
              isValid = false;
          }
          return isValid;
        },
        getDataTypeSize: function(t) {
          var s = 0;
          switch (t) {
            case 0:
            case 1:
              s = 1;
              break;
            case 2:
            case 3:
              s = 2;
              break;
            case 4:
            case 5:
            case 6:
              s = 4;
              break;
            case 7:
              s = 8;
              break;
            default:
              s = t;
          }
          return s;
        },
        getDataTypeUsed: function(dt, tc) {
          var t = dt;
          switch (dt) {
            case 2:
            case 4:
              t = dt - tc;
              break;
            case 3:
            case 5:
              t = dt - 2 * tc;
              break;
            case 6:
              if (0 === tc) {
                t = dt;
              } else if (1 === tc) {
                t = 2;
              } else {
                t = 1;
              }
              break;
            case 7:
              if (0 === tc) {
                t = dt;
              } else {
                t = dt - 2 * tc + 1;
              }
              break;
            default:
              t = dt;
              break;
          }
          return t;
        },
        getOnePixel: function(block, blockPtr, offsetType, view) {
          var temp = 0;
          switch (offsetType) {
            case 0:
              temp = view.getInt8(blockPtr);
              break;
            case 1:
              temp = view.getUint8(blockPtr);
              break;
            case 2:
              temp = view.getInt16(blockPtr, true);
              break;
            case 3:
              temp = view.getUint16(blockPtr, true);
              break;
            case 4:
              temp = view.getInt32(blockPtr, true);
              break;
            case 5:
              temp = view.getUInt32(blockPtr, true);
              break;
            case 6:
              temp = view.getFloat32(blockPtr, true);
              break;
            case 7:
              temp = view.getFloat64(blockPtr, true);
              break;
            default:
              throw "the decoder does not understand this pixel type";
          }
          return temp;
        },
        swapDimensionOrder: function(pixels, numPixels, numDims, OutPixelTypeArray, inputIsBIP) {
          var i = 0, j = 0, iDim = 0, temp = 0, swap = pixels;
          if (numDims > 1) {
            swap = new OutPixelTypeArray(numPixels * numDims);
            if (inputIsBIP) {
              for (i = 0; i < numPixels; i++) {
                temp = i;
                for (iDim = 0; iDim < numDims; iDim++, temp += numPixels) {
                  swap[temp] = pixels[j++];
                }
              }
            } else {
              for (i = 0; i < numPixels; i++) {
                temp = i;
                for (iDim = 0; iDim < numDims; iDim++, temp += numPixels) {
                  swap[j++] = pixels[temp];
                }
              }
            }
          }
          return swap;
        }
      };
      var TreeNode = function(val, left, right) {
        this.val = val;
        this.left = left;
        this.right = right;
      };
      var Lerc2Decode2 = {
        /*
        * ********removed options compared to LERC1. We can bring some of them back if needed.
         * removed pixel type. LERC2 is typed and doesn't require user to give pixel type
         * changed encodedMaskData to maskData. LERC2 's js version make it faster to use maskData directly.
         * removed returnMask. mask is used by LERC2 internally and is cost free. In case of user input mask, it's returned as well and has neglible cost.
         * removed nodatavalue. Because LERC2 pixels are typed, nodatavalue will sacrify a useful value for many types (8bit, 16bit) etc,
         *       user has to be knowledgable enough about raster and their data to avoid usability issues. so nodata value is simply removed now.
         *       We can add it back later if their's a clear requirement.
         * removed encodedMask. This option was not implemented in LercDecode. It can be done after decoding (less efficient)
         * removed computeUsedBitDepths.
         *
         *
         * response changes compared to LERC1
         * 1. encodedMaskData is not available
         * 2. noDataValue is optional (returns only if user's noDataValue is with in the valid data type range)
         * 3. maskData is always available
        */
        /*****************
        *  public properties
        ******************/
        //HUFFMAN_LUT_BITS_MAX: 12, //use 2^12 lut, not configurable
        /*****************
        *  public methods
        *****************/
        /**
         * Decode a LERC2 byte stream and return an object containing the pixel data and optional metadata.
         *
         * @param {ArrayBuffer} input The LERC input byte stream
         * @param {object} [options] options Decoding options
         * @param {number} [options.inputOffset] The number of bytes to skip in the input byte stream. A valid LERC file is expected at that position
         * @param {boolean} [options.returnFileInfo] If true, the return value will have a fileInfo property that contains metadata obtained from the LERC headers and the decoding process
         * @param {boolean} [options.returnPixelInterleavedDims]  If true, returned dimensions are pixel-interleaved, a.k.a [p1_dim0, p1_dim1, p1_dimn, p2_dim0...], default is [p1_dim0, p2_dim0, ..., p1_dim1, p2_dim1...]
         */
        decode: function(input, options) {
          options = options || {};
          var noDataValue = options.noDataValue;
          var i = 0, data = {};
          data.ptr = options.inputOffset || 0;
          data.pixels = {};
          if (!Lerc2Helpers.readHeaderInfo(input, data)) {
            return;
          }
          var headerInfo = data.headerInfo;
          var fileVersion = headerInfo.fileVersion;
          var OutPixelTypeArray = Lerc2Helpers.getDataTypeArray(headerInfo.imageType);
          if (fileVersion > 5) {
            throw "unsupported lerc version 2." + fileVersion;
          }
          Lerc2Helpers.readMask(input, data);
          if (headerInfo.numValidPixel !== headerInfo.width * headerInfo.height && !data.pixels.resultMask) {
            data.pixels.resultMask = options.maskData;
          }
          var numPixels = headerInfo.width * headerInfo.height;
          data.pixels.resultPixels = new OutPixelTypeArray(numPixels * headerInfo.numDims);
          data.counter = {
            onesweep: 0,
            uncompressed: 0,
            lut: 0,
            bitstuffer: 0,
            constant: 0,
            constantoffset: 0
          };
          var useBSQForOutputDim = !options.returnPixelInterleavedDims;
          if (headerInfo.numValidPixel !== 0) {
            if (headerInfo.zMax === headerInfo.zMin) {
              Lerc2Helpers.constructConstantSurface(data, useBSQForOutputDim);
            } else if (fileVersion >= 4 && Lerc2Helpers.checkMinMaxRanges(input, data)) {
              Lerc2Helpers.constructConstantSurface(data, useBSQForOutputDim);
            } else {
              var view = new DataView(input, data.ptr, 2);
              var bReadDataOneSweep = view.getUint8(0);
              data.ptr++;
              if (bReadDataOneSweep) {
                Lerc2Helpers.readDataOneSweep(input, data, OutPixelTypeArray, useBSQForOutputDim);
              } else {
                if (fileVersion > 1 && headerInfo.imageType <= 1 && Math.abs(headerInfo.maxZError - 0.5) < 1e-5) {
                  var flagHuffman = view.getUint8(1);
                  data.ptr++;
                  data.encodeMode = flagHuffman;
                  if (flagHuffman > 2 || fileVersion < 4 && flagHuffman > 1) {
                    throw "Invalid Huffman flag " + flagHuffman;
                  }
                  if (flagHuffman) {
                    Lerc2Helpers.readHuffman(input, data, OutPixelTypeArray, useBSQForOutputDim);
                  } else {
                    Lerc2Helpers.readTiles(input, data, OutPixelTypeArray, useBSQForOutputDim);
                  }
                } else {
                  Lerc2Helpers.readTiles(input, data, OutPixelTypeArray, useBSQForOutputDim);
                }
              }
            }
          }
          data.eofOffset = data.ptr;
          var diff;
          if (options.inputOffset) {
            diff = data.headerInfo.blobSize + options.inputOffset - data.ptr;
            if (Math.abs(diff) >= 1) {
              data.eofOffset = options.inputOffset + data.headerInfo.blobSize;
            }
          } else {
            diff = data.headerInfo.blobSize - data.ptr;
            if (Math.abs(diff) >= 1) {
              data.eofOffset = data.headerInfo.blobSize;
            }
          }
          var result = {
            width: headerInfo.width,
            height: headerInfo.height,
            pixelData: data.pixels.resultPixels,
            minValue: headerInfo.zMin,
            maxValue: headerInfo.zMax,
            validPixelCount: headerInfo.numValidPixel,
            dimCount: headerInfo.numDims,
            dimStats: {
              minValues: headerInfo.minValues,
              maxValues: headerInfo.maxValues
            },
            maskData: data.pixels.resultMask
            //noDataValue: noDataValue
          };
          if (data.pixels.resultMask && Lerc2Helpers.isValidPixelValue(headerInfo.imageType, noDataValue)) {
            var mask = data.pixels.resultMask;
            for (i = 0; i < numPixels; i++) {
              if (!mask[i]) {
                result.pixelData[i] = noDataValue;
              }
            }
            result.noDataValue = noDataValue;
          }
          data.noDataValue = noDataValue;
          if (options.returnFileInfo) {
            result.fileInfo = Lerc2Helpers.formatFileInfo(data);
          }
          return result;
        },
        getBandCount: function(input) {
          var count = 0;
          var i = 0;
          var temp = {};
          temp.ptr = 0;
          temp.pixels = {};
          while (i < input.byteLength - 58) {
            Lerc2Helpers.readHeaderInfo(input, temp);
            i += temp.headerInfo.blobSize;
            count++;
            temp.ptr = i;
          }
          return count;
        }
      };
      return Lerc2Decode2;
    }();
    var isPlatformLittleEndian = function() {
      var a = new ArrayBuffer(4);
      var b = new Uint8Array(a);
      var c = new Uint32Array(a);
      c[0] = 1;
      return b[0] === 1;
    }();
    var Lerc2 = {
      /************wrapper**********************************************/
      /**
       * A wrapper for decoding both LERC1 and LERC2 byte streams capable of handling multiband pixel blocks for various pixel types.
       *
       * @alias module:Lerc
       * @param {ArrayBuffer} input The LERC input byte stream
       * @param {object} [options] The decoding options below are optional.
       * @param {number} [options.inputOffset] The number of bytes to skip in the input byte stream. A valid Lerc file is expected at that position.
       * @param {string} [options.pixelType] (LERC1 only) Default value is F32. Valid pixel types for input are U8/S8/S16/U16/S32/U32/F32.
       * @param {number} [options.noDataValue] (LERC1 only). It is recommended to use the returned mask instead of setting this value.
       * @param {boolean} [options.returnPixelInterleavedDims] (nDim LERC2 only) If true, returned dimensions are pixel-interleaved, a.k.a [p1_dim0, p1_dim1, p1_dimn, p2_dim0...], default is [p1_dim0, p2_dim0, ..., p1_dim1, p2_dim1...]
       * @returns {{width, height, pixels, pixelType, mask, statistics}}
         * @property {number} width Width of decoded image.
         * @property {number} height Height of decoded image.
         * @property {array} pixels [band1, band2, …] Each band is a typed array of width*height.
         * @property {string} pixelType The type of pixels represented in the output.
         * @property {mask} mask Typed array with a size of width*height, or null if all pixels are valid.
         * @property {array} statistics [statistics_band1, statistics_band2, …] Each element is a statistics object representing min and max values
      **/
      decode: function(encodedData, options) {
        if (!isPlatformLittleEndian) {
          throw "Big endian system is not supported.";
        }
        options = options || {};
        var inputOffset = options.inputOffset || 0;
        var fileIdView = new Uint8Array(encodedData, inputOffset, 10);
        var fileIdentifierString = String.fromCharCode.apply(null, fileIdView);
        var lerc, majorVersion;
        if (fileIdentifierString.trim() === "CntZImage") {
          lerc = LercDecode2;
          majorVersion = 1;
        } else if (fileIdentifierString.substring(0, 5) === "Lerc2") {
          lerc = Lerc2Decode;
          majorVersion = 2;
        } else {
          throw "Unexpected file identifier string: " + fileIdentifierString;
        }
        var iPlane = 0, eof = encodedData.byteLength - 10, encodedMaskData, bandMasks = [], bandMask, maskData;
        var decodedPixelBlock = {
          width: 0,
          height: 0,
          pixels: [],
          pixelType: options.pixelType,
          mask: null,
          statistics: []
        };
        var uniqueBandMaskCount = 0;
        while (inputOffset < eof) {
          var result = lerc.decode(encodedData, {
            inputOffset,
            //for both lerc1 and lerc2
            encodedMaskData,
            //lerc1 only
            maskData,
            //lerc2 only
            returnMask: iPlane === 0 ? true : false,
            //lerc1 only
            returnEncodedMask: iPlane === 0 ? true : false,
            //lerc1 only
            returnFileInfo: true,
            //for both lerc1 and lerc2
            returnPixelInterleavedDims: options.returnPixelInterleavedDims,
            //for ndim lerc2 only
            pixelType: options.pixelType || null,
            //lerc1 only
            noDataValue: options.noDataValue || null
            //lerc1 only
          });
          inputOffset = result.fileInfo.eofOffset;
          maskData = result.maskData;
          if (iPlane === 0) {
            encodedMaskData = result.encodedMaskData;
            decodedPixelBlock.width = result.width;
            decodedPixelBlock.height = result.height;
            decodedPixelBlock.dimCount = result.dimCount || 1;
            decodedPixelBlock.pixelType = result.pixelType || result.fileInfo.pixelType;
            decodedPixelBlock.mask = maskData;
          }
          if (majorVersion > 1) {
            if (maskData) {
              bandMasks.push(maskData);
            }
            if (result.fileInfo.mask && result.fileInfo.mask.numBytes > 0) {
              uniqueBandMaskCount++;
            }
          }
          iPlane++;
          decodedPixelBlock.pixels.push(result.pixelData);
          decodedPixelBlock.statistics.push({
            minValue: result.minValue,
            maxValue: result.maxValue,
            noDataValue: result.noDataValue,
            dimStats: result.dimStats
          });
        }
        var i, j, numPixels;
        if (majorVersion > 1 && uniqueBandMaskCount > 1) {
          numPixels = decodedPixelBlock.width * decodedPixelBlock.height;
          decodedPixelBlock.bandMasks = bandMasks;
          maskData = new Uint8Array(numPixels);
          maskData.set(bandMasks[0]);
          for (i = 1; i < bandMasks.length; i++) {
            bandMask = bandMasks[i];
            for (j = 0; j < numPixels; j++) {
              maskData[j] = maskData[j] & bandMask[j];
            }
          }
          decodedPixelBlock.maskData = maskData;
        }
        return decodedPixelBlock;
      }
    };
    if (module.exports) {
      module.exports = Lerc2;
    } else {
      this.Lerc = Lerc2;
    }
  })();
})(LercDecode);
var LercDecodeExports = LercDecode.exports;
const Lerc = /* @__PURE__ */ getDefaultExportFromCjs(LercDecodeExports);
let init;
let instance;
let heap;
const IMPORT_OBJECT = {
  env: {
    emscripten_notify_memory_growth: function(index) {
      heap = new Uint8Array(instance.exports.memory.buffer);
    }
  }
};
class ZSTDDecoder {
  init() {
    if (init)
      return init;
    if (typeof fetch !== "undefined") {
      init = fetch("data:application/wasm;base64," + wasm).then((response) => response.arrayBuffer()).then((arrayBuffer) => WebAssembly.instantiate(arrayBuffer, IMPORT_OBJECT)).then(this._init);
    } else {
      init = WebAssembly.instantiate(Buffer.from(wasm, "base64"), IMPORT_OBJECT).then(this._init);
    }
    return init;
  }
  _init(result) {
    instance = result.instance;
    IMPORT_OBJECT.env.emscripten_notify_memory_growth(0);
  }
  decode(array, uncompressedSize = 0) {
    if (!instance)
      throw new Error(`ZSTDDecoder: Await .init() before decoding.`);
    const compressedSize = array.byteLength;
    const compressedPtr = instance.exports.malloc(compressedSize);
    heap.set(array, compressedPtr);
    uncompressedSize = uncompressedSize || Number(instance.exports.ZSTD_findDecompressedSize(compressedPtr, compressedSize));
    const uncompressedPtr = instance.exports.malloc(uncompressedSize);
    const actualSize = instance.exports.ZSTD_decompress(uncompressedPtr, uncompressedSize, compressedPtr, compressedSize);
    const dec = heap.slice(uncompressedPtr, uncompressedPtr + actualSize);
    instance.exports.free(compressedPtr);
    instance.exports.free(uncompressedPtr);
    return dec;
  }
}
const wasm = "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IAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQh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ASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigC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C0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdB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IAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY0AAQMyIFEAMiBg0AIANBHzYCfCADIANB/ABqIANB+ABqIAQgBCAFaiAGGyIEIAEgAmoiAiAEaxAVIgUQAw0AIAMoAnwiBkEfSw0AIAMoAngiB0EJTw0AIABBiCBqIAMgBkGAC0GADCAHEBggA0E0NgJ8IAMgA0H8AGogA0H4AGogBCAFaiIEIAIgBGsQFSIFEAMNACADKAJ8IgZBNEsNACADKAJ4IgdBCk8NACAAQZAwaiADIAZBgA1B4A4gBxAYIANBIzYCfCADIANB/ABqIANB+ABqIAQgBWoiBCACIARrEBUiBRADDQAgAygCfCIGQSNLDQAgAygCeCIHQQpPDQAgACADIAZBwBBB0BEgBxAYIAQgBWoiBEEMaiIFIAJLDQAgAiAFayEFQQAhAgNAIAJBA0cEQCAEKAAAIgZBf2ogBU8NAiAAIAJBAnRqQZzQAWogBjYCACACQQFqIQIgBEEEaiEEDAELCyAEIAFrIQgLIANBgAFqJAAgCAtGAQN/IABBCGohAyAAKAIEIQJBACEAA0AgACACdkUEQCABIAMgAEEDdGotAAJBFktqIQEgAEEBaiEADAELCyABQQggAmt0C4YDAQV/Qbh/IQcCQCADRQ0AIAItAAAiBEUEQCABQQA2AgBBAUG4fyADQQFGGw8LAn8gAkEBaiIFIARBGHRBGHUiBkF/Sg0AGiAGQX9GBEAgA0EDSA0CIAUvAABBgP4BaiEEIAJBA2oMAQsgA0ECSA0BIAItAAEgBEEIdHJBgIB+aiEEIAJBAmoLIQUgASAENgIAIAVBAWoiASACIANqIgNLDQBBbCEHIABBEGogACAFLQAAIgVBBnZBI0EJIAEgAyABa0HAEEHQEUHwEiAAKAKM4QEgACgCnOIBIAQQHyIGEAMiCA0AIABBmCBqIABBCGogBUEEdkEDcUEfQQggASABIAZqIAgbIgEgAyABa0GAC0GADEGAFyAAKAKM4QEgACgCnOIBIAQQHyIGEAMiCA0AIABBoDBqIABBBGogBUECdkEDcUE0QQkgASABIAZqIAgbIgEgAyABa0GADUHgDkGQGSAAKAKM4QEgACgCnOIBIAQQHyIAEAMNACAAIAFqIAJrIQcLIAcLrQMBCn8jAEGABGsiCCQAAn9BUiACQf8BSw0AGkFUIANBDEsNABogAkEBaiELIABBBGohCUGAgAQgA0F/anRBEHUhCkEAIQJBASEEQQEgA3QiB0F/aiIMIQUDQCACIAtGRQRAAkAgASACQQF0Ig1qLwEAIgZB//8DRgRAIAkgBUECdGogAjoAAiAFQX9qIQVBASEGDAELIARBACAKIAZBEHRBEHVKGyEECyAIIA1qIAY7AQAgAkEBaiECDAELCyAAIAQ7AQIgACADOwEAIAdBA3YgB0EBdmpBA2ohBkEAIQRBACECA0AgBCALRkUEQCABIARBAXRqLgEAIQpBACEAA0AgACAKTkUEQCAJIAJBAnRqIAQ6AAIDQCACIAZqIAxxIgIgBUsNAAsgAEEBaiEADAELCyAEQQFqIQQMAQsLQX8gAg0AGkEAIQIDfyACIAdGBH9BAAUgCCAJIAJBAnRqIgAtAAJBAXRqIgEgAS8BACIBQQFqOwEAIAAgAyABEBRrIgU6AAMgACABIAVB/wFxdCAHazsBACACQQFqIQIMAQsLCyEFIAhBgARqJAAgBQvjBgEIf0FsIQcCQCACQQNJDQACQAJAAkACQCABLQAAIgNBA3EiCUEBaw4DAwEAAgsgACgCiOEBDQBBYg8LIAJBBUkNAkEDIQYgASgAACEFAn8CQAJAIANBAnZBA3EiCEF+aiIEQQFNBEAgBEEBaw0BDAILIAVBDnZB/wdxIQQgBUEEdkH/B3EhAyAIRQwCCyAFQRJ2IQRBBCEGIAVBBHZB//8AcSEDQQAMAQsgBUEEdkH//w9xIgNBgIAISw0DIAEtAARBCnQgBUEWdnIhBEEFIQZBAAshBSAEIAZqIgogAksNAgJAIANBgQZJDQAgACgCnOIBRQ0AQQAhAgNAIAJBg4ABSw0BIAJBQGshAgwAAAsACwJ/IAlBA0YEQCABIAZqIQEgAEHw4gFqIQIgACgCDCEGIAUEQCACIAMgASAEIAYQXwwCCyACIAMgASAEIAYQXQwBCyAAQbjQAWohAiABIAZqIQEgAEHw4gFqIQYgAEGo0ABqIQggBQRAIAggBiADIAEgBCACEF4MAQsgCCAGIAMgASAEIAIQXAsQAw0CIAAgAzYCgOIBIABBATYCiOEBIAAgAEHw4gFqNgLw4QEgCUECRgRAIAAgAEGo0ABqNgIMCyAAIANqIgBBiOMBakIANwAAIABBgOMBakIANwAAIABB+OIBakIANwAAIABB8OIBakIANwAAIAoPCwJ/AkACQAJAIANBAnZBA3FBf2oiBEECSw0AIARBAWsOAgACAQtBASEEIANBA3YMAgtBAiEEIAEvAABBBHYMAQtBAyEEIAEQIUEEdgsiAyAEaiIFQSBqIAJLBEAgBSACSw0CIABB8OIBaiABIARqIAMQCyEBIAAgAzYCgOIBIAAgATYC8OEBIAEgA2oiAEIANwAYIABCADcAECAAQgA3AAggAEIANwAAIAUPCyAAIAM2AoDiASAAIAEgBGo2AvDhASAFDwsCfwJAAkACQCADQQJ2QQNxQX9qIgRBAksNACAEQQFrDgIAAgELQQEhByADQQN2DAILQQIhByABLwAAQQR2DAELIAJBBEkgARAhIgJBj4CAAUtyDQFBAyEHIAJBBHYLIQIgAEHw4gFqIAEgB2otAAAgAkEgahAQIQEgACACNgKA4gEgACABNgLw4QEgB0EBaiEHCyAHC0sAIABC+erQ0OfJoeThADcDICAAQgA3AxggAELP1tO+0ser2UI3AxAgAELW64Lu6v2J9eAANwMIIABCADcDACAAQShqQQBBKBAQGgviAgICfwV+IABBKGoiASAAKAJIaiECAn4gACkDACIDQiBaBEAgACkDECIEQgeJIAApAwgiBUIBiXwgACkDGCIGQgyJfCAAKQMgIgdCEol8IAUQGSAEEBkgBhAZIAcQGQwBCyAAKQMYQsXP2bLx5brqJ3wLIAN8IQMDQCABQQhqIgAgAk0EQEIAIAEpAAAQCSADhUIbiUKHla+vmLbem55/fkLj3MqV/M7y9YV/fCEDIAAhAQwBCwsCQCABQQRqIgAgAksEQCABIQAMAQsgASgAAK1Ch5Wvr5i23puef34gA4VCF4lCz9bTvtLHq9lCfkL5893xmfaZqxZ8IQMLA0AgACACSQRAIAAxAABCxc/ZsvHluuonfiADhUILiUKHla+vmLbem55/fiEDIABBAWohAAwBCwsgA0IhiCADhULP1tO+0ser2UJ+IgNCHYggA4VC+fPd8Zn2masWfiIDQiCIIAOFC+8CAgJ/BH4gACAAKQMAIAKtfDcDAAJAAkAgACgCSCIDIAJqIgRBH00EQCABRQ0BIAAgA2pBKGogASACECAgACgCSCACaiEEDAELIAEgAmohAgJ/IAMEQCAAQShqIgQgA2ogAUEgIANrECAgACAAKQMIIAQpAAAQCTcDCCAAIAApAxAgACkAMBAJNwMQIAAgACkDGCAAKQA4EAk3AxggACAAKQMgIABBQGspAAAQCTcDICAAKAJIIQMgAEEANgJIIAEgA2tBIGohAQsgAUEgaiACTQsEQCACQWBqIQMgACkDICEFIAApAxghBiAAKQMQIQcgACkDCCEIA0AgCCABKQAAEAkhCCAHIAEpAAgQCSEHIAYgASkAEBAJIQYgBSABKQAYEAkhBSABQSBqIgEgA00NAAsgACAFNwMgIAAgBjcDGCAAIAc3AxAgACAINwMICyABIAJPDQEgAEEoaiABIAIgAWsiBBAgCyAAIAQ2AkgLCy8BAX8gAEUEQEG2f0EAIAMbDwtBun8hBCADIAFNBH8gACACIAMQEBogAwVBun8LCy8BAX8gAEUEQEG2f0EAIAMbDwtBun8hBCADIAFNBH8gACACIAMQCxogAwVBun8LC6gCAQZ/IwBBEGsiByQAIABB2OABaikDAEKAgIAQViEIQbh/IQUCQCAEQf//B0sNACAAIAMgBBBCIgUQAyIGDQAgACgCnOIBIQkgACAHQQxqIAMgAyAFaiAGGyIKIARBACAFIAYbayIGEEAiAxADBEAgAyEFDAELIAcoAgwhBCABRQRAQbp/IQUgBEEASg0BCyAGIANrIQUgAyAKaiEDAkAgCQRAIABBADYCnOIBDAELAkACQAJAIARBBUgNACAAQdjgAWopAwBCgICACFgNAAwBCyAAQQA2ApziAQwBCyAAKAIIED8hBiAAQQA2ApziASAGQRRPDQELIAAgASACIAMgBSAEIAgQOSEFDAELIAAgASACIAMgBSAEIAgQOiEFCyAHQRBqJAAgBQtnACAAQdDgAWogASACIAAoAuzhARAuIgEQAwRAIAEPC0G4fyECAkAgAQ0AIABB7OABaigCACIBBEBBYCECIAAoApjiASABRw0BC0EAIQIgAEHw4AFqKAIARQ0AIABBkOEBahBDCyACCycBAX8QVyIERQRAQUAPCyAEIAAgASACIAMgBBBLEE8hACAEEFYgAAs/AQF/AkACQAJAIAAoAqDiAUEBaiIBQQJLDQAgAUEBaw4CAAECCyAAEDBBAA8LIABBADYCoOIBCyAAKAKU4gELvAMCB38BfiMAQRBrIgkkAEG4fyEGAkAgBCgCACIIQQVBCSAAKALs4QEiBRtJDQAgAygCACIHQQFBBSAFGyAFEC8iBRADBEAgBSEGDAELIAggBUEDakkNACAAIAcgBRBJIgYQAw0AIAEgAmohCiAAQZDhAWohCyAIIAVrIQIgBSAHaiEHIAEhBQNAIAcgAiAJECwiBhADDQEgAkF9aiICIAZJBEBBuH8hBgwCCyAJKAIAIghBAksEQEFsIQYMAgsgB0EDaiEHAn8CQAJAAkAgCEEBaw4CAgABCyAAIAUgCiAFayAHIAYQSAwCCyAFIAogBWsgByAGEEcMAQsgBSAKIAVrIActAAAgCSgCCBBGCyIIEAMEQCAIIQYMAgsgACgC8OABBEAgCyAFIAgQRQsgAiAGayECIAYgB2ohByAFIAhqIQUgCSgCBEUNAAsgACkD0OABIgxCf1IEQEFsIQYgDCAFIAFrrFINAQsgACgC8OABBEBBaiEGIAJBBEkNASALEEQhDCAHKAAAIAynRw0BIAdBBGohByACQXxqIQILIAMgBzYCACAEIAI2AgAgBSABayEGCyAJQRBqJAAgBgsuACAAECsCf0EAQQAQAw0AGiABRSACRXJFBEBBYiAAIAEgAhA9EAMNARoLQQALCzcAIAEEQCAAIAAoAsTgASABKAIEIAEoAghqRzYCnOIBCyAAECtBABADIAFFckUEQCAAIAEQWwsL0QIBB38jAEEQayIGJAAgBiAENgIIIAYgAzYCDCAFBEAgBSgCBCEKIAUoAgghCQsgASEIAkACQANAIAAoAuzhARAWIQsCQANAIAQgC0kNASADKAAAQXBxQdDUtMIBRgRAIAMgBBAiIgcQAw0EIAQgB2shBCADIAdqIQMMAQsLIAYgAzYCDCAGIAQ2AggCQCAFBEAgACAFEE5BACEHQQAQA0UNAQwFCyAAIAogCRBNIgcQAw0ECyAAIAgQUCAMQQFHQQAgACAIIAIgBkEMaiAGQQhqEEwiByIDa0EAIAMQAxtBCkdyRQRAQbh/IQcMBAsgBxADDQMgAiAHayECIAcgCGohCEEBIQwgBigCDCEDIAYoAgghBAwBCwsgBiADNgIMIAYgBDYCCEG4fyEHIAQNASAIIAFrIQcMAQsgBiADNgIMIAYgBDYCCAsgBkEQaiQAIAcLRgECfyABIAAoArjgASICRwRAIAAgAjYCxOABIAAgATYCuOABIAAoArzgASEDIAAgATYCvOABIAAgASADIAJrajYCwOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEE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";
const zstd = new ZSTDDecoder();
class LercDecoder extends BaseDecoder {
  constructor(fileDirectory) {
    super();
    this.planarConfiguration = typeof fileDirectory.PlanarConfiguration !== "undefined" ? fileDirectory.PlanarConfiguration : 1;
    this.samplesPerPixel = typeof fileDirectory.SamplesPerPixel !== "undefined" ? fileDirectory.SamplesPerPixel : 1;
    this.addCompression = fileDirectory.LercParameters[LercParameters.AddCompression];
  }
  decodeBlock(buffer) {
    switch (this.addCompression) {
      case LercAddCompression.None:
        break;
      case LercAddCompression.Deflate:
        buffer = inflate_1(new Uint8Array(buffer)).buffer;
        break;
      case LercAddCompression.Zstandard:
        buffer = zstd.decode(new Uint8Array(buffer)).buffer;
        break;
      default:
        throw new Error(`Unsupported LERC additional compression method identifier: ${this.addCompression}`);
    }
    const lercResult = Lerc.decode(buffer, { returnPixelInterleavedDims: this.planarConfiguration === 1 });
    const lercData = lercResult.pixels[0];
    return lercData.buffer;
  }
}
export {
  LercDecoder as default,
  zstd
};
