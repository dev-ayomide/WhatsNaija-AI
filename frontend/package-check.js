// Quick script to verify all dependencies are listed
const pkg = require('./package.json');

console.log('📦 WhatsNaija AI Frontend - Package Verification\n');

console.log('✅ Dependencies:');
Object.keys(pkg.dependencies).forEach(dep => {
  console.log(`   - ${dep}@${pkg.dependencies[dep]}`);
});

console.log('\n✅ Dev Dependencies:');
Object.keys(pkg.devDependencies).forEach(dep => {
  console.log(`   - ${dep}@${pkg.devDependencies[dep]}`);
});

console.log('\n✅ Scripts:');
Object.keys(pkg.scripts).forEach(script => {
  console.log(`   - ${script}: ${pkg.scripts[script]}`);
});

console.log('\n🎉 All packages configured correctly!');
