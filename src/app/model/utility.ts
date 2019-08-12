
export class Utility {
    /*
     {
     "stage": "PRODUCTION",
     "seasonId": "8851b6d6-8d54-4d10-8a9c-209a1cb19c53",
     "utility": "function daysFromToday(targetDate) {\r\n\r\n  var date1 = new Date(targetDate);\r\n\r\n  var date2 = new Date();\r\n\r\n  var timeDiff = Math.abs(date2.getTime() - date1.getTime());\r\n\r\n  var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));\r\n\r\n  return diffDays;\r\n\r\n};\r\n",
     "lastModified": 1497984753187,
     "type": "MAIN_UTILITY",
     "uniqueId": "30ac44b8-6ea0-473a-9565-136974aa2d3f"
     }
     */
    uniqueId: string;
    seasonId: string;
    stage: string;
    type: string;
    name:string;
    utility: string;
    lastModified: number;

    constructor(u?:Utility){

        if (u) {
            this.uniqueId = u.uniqueId;
            this.seasonId = u.seasonId;
            this.stage = u.stage;
            this.type = u.type;
            this.utility = u.utility;
            this.name = u.name;
            this.lastModified = u.lastModified;
        } else {
            this.uniqueId = '';
            this.seasonId = '';
            this.stage = '';
            this.type = '';
            this.utility = '';
            this.name = '';
            this.lastModified = 0;
        }
    }
}

