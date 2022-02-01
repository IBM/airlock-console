export class Webhook {
    creator: string;
    uniqueId: string;
    name: string;
    lastModified: number;
    minStage: string;
    creationDate: number;
    sendRuntime: boolean;
    sendAdmin: boolean;
    url: string;
    products: string[];


    static clone(src: Webhook): Webhook {
        let toRet: Webhook = new Webhook();
        toRet.uniqueId = src.uniqueId;
        toRet.name = src.name;
        toRet.lastModified = src.lastModified;
        toRet.creator = src.creator;
        toRet.minStage = src.minStage;
        toRet.sendRuntime = src.sendRuntime;
        toRet.sendAdmin = src.sendAdmin;
        toRet.creationDate = src.creationDate;
        toRet.url = src.url;
        toRet.products = Webhook.duplicateArrayString(src.products);
        return toRet;
    }

    static duplicateArrayString(array: Array<string>): Array<string> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(x);
            })
        }
        return arr;
    }

    static duplicateArray(array: Array<any>): Array<any> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(Object.assign({}, x));
            })
        }
        return arr;
    }
}
