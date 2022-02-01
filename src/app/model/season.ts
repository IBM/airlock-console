import {Feature} from './feature';

export class Season {
    minVersion: string;
    maxVersion: string;
    name: string;
    uniqueId: string;
    productId: string;
    lastModified: number;
    runtimeEncryption: boolean;
    root: Feature;
    platforms: string[];
    serverVersion: string;

    constructor(s?: Season) {

        if (s) {
            this.name = s.name;
            this.uniqueId = s.uniqueId;
            this.productId = s.productId;
            this.minVersion = s.minVersion;
            this.maxVersion = s.maxVersion;
            this.lastModified = s.lastModified;
            this.runtimeEncryption = s.runtimeEncryption;
            if (s.root) {
                this.root = Feature.clone(s.root);
            }
        } else {
            this.name = '';
            this.minVersion = '';
            this.maxVersion = '';
        }
    }
}

