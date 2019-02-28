var fs = require('fs');


function base64_encode(file) {
    var buff = fs.readFileSync(file);
    return new Buffer(buff).toString('base64');
}


function base64_decode(base64str, file) {
    var buff = new Buffer(base64str, 'base64');
    fs.writeFileSync(file, buff);
    console.log('File created from base64 encoded string');
}



// convert image to base64 encoded string
var base64str = base64_encode('ashraf.PNG');
console.log(base64str);


//convert base64 string back to image 
base64_decode(base64str, 'Ashraf2.PNG');
