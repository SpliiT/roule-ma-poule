const fs = require('fs');
const path = require('path');

function removeComments(content) {
    
    
    
    
    
    return content.replace(/("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`|\/([^\/\\]|\\.)+\/)|(\/\*[\s\S]*?\*\/|\/\/.*)/g, (match, group1) => {
        if (group1) return match; 
        return ""; 
    });
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else if (file.match(/\.(ts|tsx|js|css|prisma)$/)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const cleaned = removeComments(content);
            if (content !== cleaned) {
                console.log('Cleaned:', fullPath);
                fs.writeFileSync(fullPath, cleaned, 'utf8');
            }
        }
    }
}

const root = process.argv[2] || '.';
processDirectory(root);
