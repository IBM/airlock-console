/**
 * Created by itaig on 26/09/2016.
 */
var fileSrcName = process.argv[2];
var fileTrgName = process.argv[3];

var mapDep = {};
var mapDevDep = {};
var isInDep = false;
var isInDevDeps = false;

var fs = require('fs');
var objSrc = JSON.parse(fs.readFileSync(fileSrcName, 'utf8'));
var objTrg = JSON.parse(fs.readFileSync(fileTrgName, 'utf8'));
var depSrc = objTrg.dependencies;
for (var p in objSrc.dependencies) {
    if( objSrc.dependencies.hasOwnProperty(p) ) {
        console.log(p +" - " + objSrc.dependencies[p]);
        depSrc[p] = objSrc.dependencies[p];
    }
}
for (var p in objSrc.devDependencies) {
    if( objSrc.devDependencies.hasOwnProperty(p) &&  objTrg.dependencies.hasOwnProperty(p)) {
        console.log(p +" - " + objSrc.devDependencies[p]);
        depSrc[p] = objSrc.devDependencies[p];
    }
}
console.log("dependencies");
console.log(depSrc);
var devdep = objTrg.devDependencies;
for (var p in objSrc.devDependencies) {
    if( objSrc.devDependencies.hasOwnProperty(p) ) {
        console.log(p +" - " + objSrc.devDependencies[p] );
        devdep[p] = objSrc.devDependencies[p];
    }
}
console.log("dev dependencies");
console.log(devdep);
var obj = {};
obj.dependencies = depSrc;
obj.devDependencies = devdep;
var newPACKAGEjson = JSON.stringify(obj,null,2);
console.log(newPACKAGEjson);
fs = require('fs');
fs.writeFile('newPackageJson.txt', newPACKAGEjson , function (err) {
    if (err) return console.log(err);
    console.log('newPackageJson.txt');
});

