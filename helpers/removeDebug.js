var fs = require('fs');
var path = require('path');
var inputFile = process.argv[2];
var outputFile = process.argv[3];
var content = fs.readFileSync(path.resolve(process.cwd(), inputFile), 'utf-8');

fs.writeFileSync(path.resolve(process.cwd(), outputFile), removeDebug(content), 'utf-8');

function removeDebug(content) {
  return content
            .replace('/*#DEBUG*/', '/*#DEBUG  ')
            .replace('/*/DEBUG*/', '  /DEBUG*/');
            
}
