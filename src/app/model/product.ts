
import { Season } from './season';

export class Product {
    seasons: Season[];
    name: string;
    description: string;
    uniqueId: string;
    codeIdentifier: string;
    lastModified: number;
    isCurrentUserFollower: boolean;
    capabilities: string[];

    constructor(p?:Product){

        if (p) {

            this.name = p.name;
            this.description = p.description;
            this.uniqueId = p.uniqueId;
            this.codeIdentifier = p.codeIdentifier;
            this.lastModified = p.lastModified;
            this.seasons = [];
            this.capabilities = p.capabilities.slice();

            this.isCurrentUserFollower = p.isCurrentUserFollower
            if(p.seasons != null) {
                for (var i = 0; i < p.seasons.length; i++) {
                    this.seasons[i] = new Season(p.seasons[i]);
                }
            }
        } else {
            this.name = '';
            this.description = '';
            this.codeIdentifier = '';
        }
    }
}