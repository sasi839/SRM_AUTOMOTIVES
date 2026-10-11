const fs = require('fs');

const path = 'src/data/serviceDetails.ts';
let content = fs.readFileSync(path, 'utf8');

// I will extract the object and manually replace it in the JS AST or via simple string replacement
// Let's just create a new serviceDetails.ts file by using the existing one as a base, but I'll write the new values here.
