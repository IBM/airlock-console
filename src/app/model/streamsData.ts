import {Stream} from "./stream";

export class StreamsData {
    filter: string;
    maxHistoryTotalSizeKB: number;
    bulkSize: number; ///hide
    seasonId: string;
    enableHistoricalEvents: boolean; ///show
    streams: Stream[];
    historyFileMaxSizeKB: number; ///show
    lastModified: number;
    keepHistoryOfLastNumberOfDays: number;
    historyBufferSize: number; ///hide

    static clone(src: StreamsData): StreamsData {
        let toRet: StreamsData = new StreamsData();
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
    }

    static duplicateStreamsArray(array: Array<Stream>): Array<Stream> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(Stream.clone(x));
            })
        }
        return arr;
    }
}
