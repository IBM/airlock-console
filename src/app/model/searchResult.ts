import {Rule} from './rule';
import {Feature} from "./feature";

export enum SearchLocation {
    NAME,
    DISPLAY_NAME,
    RULE,
    CONFIGURATION_VALUES,
    DESCRIPTION
}
export class SearchHit {
    location: SearchLocation;
    hit: string;
}
export class SearchResult {
    obj: Feature;
    type: string;
    searchHits: Array<SearchHit> = new Array();
}
