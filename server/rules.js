const JsDiff = require('diff');
const { NodeVM } = require('vm2');
const vm = new NodeVM({
    console: 'redirect',
    timeout: 1000,
    sandbox: {}
});
let passed = false;
vm.on('console.log', function (args) {
    passed = (args === 'Hello world');
});

function validateChange (oldCode, newCode) {
    const diffs = JsDiff.diffChars(oldCode, newCode);
    if (diffs > 4) return 'Too many changes';
    let removals = 0;
    let adds = 0;
    for (let index = 0; index < diffs.length; index++) {
        const { added, removed, count } = diffs[index]
        console.log(diffs[index]);
        if (!(added || removed)) continue;
        if (count > 1) return 'Change to long';
        if (added && adds > 0) return 'Too many changes';
        if (added) adds += 1;
        if (removed && removals > 0) return 'Too many changes'; 
        if (removed) removals += 1;
    }

    return 'valid';
}

function testCode (code) {
    vm.run(code); 
    return passed;
}

module.exports = {
    testCode,
    validateChange,
};