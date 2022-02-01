"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsData = void 0;
var stream_1 = require("./stream");
var StreamsData = /** @class */ (function () {
    function StreamsData() {
    }
    StreamsData.clone = function (src) {
        var toRet = new StreamsData();
        toRet.filter = src.filter;
        toRet.maxHistoryTotalSizeKB = src.maxHistoryTotalSizeKB;
        toRet.bulkSize = src.bulkSize;
        toRet.seasonId = src.seasonId;
        toRet.enableHistoricalEvents = src.enableHistoricalEvents;
        toRet.streams = StreamsData.duplicateStreamsArray(src.streams);
        toRet.historyFileMaxSizeKB = src.historyFileMaxSizeKB;
        toRet.lastModified = src.lastModified;
        toRet.keepHistoryOfLastNumberOfDays = src.keepHistoryOfLastNumberOfDays;
        toRet.historyBufferSize = src.historyBufferSize;
        return toRet;
    };
    StreamsData.duplicateStreamsArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(stream_1.Stream.clone(x));
            });
        }
        return arr;
    };
    return StreamsData;
}());
exports.StreamsData = StreamsData;
//# sourceMappingURL=streamsData.js.map