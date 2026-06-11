const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test_json.json'));
let innerStr = data[3][5];
innerStr = innerStr.replace(")]}'", "").trim();
const innerJson = JSON.parse(innerStr);

function traverse(obj, path = '') {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => traverse(v, path + '[' + i + ']'));
  } else if (typeof obj === 'string' && obj.length > 5) {
    console.log(path + ' = ' + obj.substring(0, 80));
  }
}

traverse(innerJson);
