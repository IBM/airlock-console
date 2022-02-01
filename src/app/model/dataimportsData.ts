/*
private Long pruneThreshold = null;
    private UUID productId;
    private List<DataImportItem> jobs = new LinkedList<>();
    private Date lastModified = new Date();
 */
import {Dataimport} from "./dataimport";

export class DataimportsData {
    productId: string;
    lastModified: number;
    pruneThreshold: number;
    jobs: Dataimport[];

    static clone(src: DataimportsData): DataimportsData {
        let toRet: DataimportsData = new DataimportsData();
        toRet.productId = src.productId;
        toRet.lastModified = src.lastModified;
        toRet.pruneThreshold = src.pruneThreshold;
        toRet.jobs = DataimportsData.duplicateArray(src.jobs);
        return toRet;
    }

    static duplicateArray(array: Array<any>): Array<any> {
        let arr = [];
        var counter = 0;
        if (array != null) {
            array.forEach((x) => {
                counter++;
                if (counter > 300 ){
                    return arr;
                }
                arr.push(Object.assign({}, x));
            })
        }
        return arr;
    }
}


