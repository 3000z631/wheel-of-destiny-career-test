const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

function createNode() {
  return {
    className: '', textContent: '', innerHTML: '', src: '', alt: '', disabled: false,
    style: {}, dataset: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    appendChild() {}, querySelectorAll() { return []; },
    set onclick(value) {}, set onkeydown(value) {}
  };
}

const nodes = new Map();
const getNode = selector => {
  if (!nodes.has(selector)) nodes.set(selector, createNode());
  return nodes.get(selector);
};

const context = vm.createContext({
  console,
  setTimeout() {},
  window: { scrollTo() {}, print() {} },
  document: {
    querySelector: getNode,
    querySelectorAll() { return []; },
    createElement: createNode
  }
});

const appPath = path.join(root, 'app-v2.js');
const source = fs.readFileSync(appPath, 'utf8');
vm.runInContext(source, context, { filename: appPath });
vm.runInContext('globalThis.__testData = { questions, careers, primary, secondary };', context);

const { questions, careers, primary, secondary } = context.__testData;
check(questions.length === 28, `题目应为 28 道，实际为 ${questions.length} 道`);
check(primary.length === 4 && secondary.length === 4, '两组维度都应包含 4 个倾向');

questions.forEach((question, index) => {
  const [chapter, title, options] = question;
  const expected = index % 2 === 0 ? primary : secondary;
  const traits = options.map(option => option[1]);
  check(Boolean(chapter && title), `第 ${index + 1} 题缺少章节或题干`);
  check(options.length === 4, `第 ${index + 1} 题不是 4 个选项`);
  check(new Set(traits).size === 4, `第 ${index + 1} 题存在重复倾向`);
  check(traits.every(trait => expected.includes(trait)), `第 ${index + 1} 题混用了不同维度组`);
});

const expectedKeys = primary.flatMap(first => secondary.map(second => `${first}|${second}`));
check(Object.keys(careers).length === 16, `职业应为 16 种，实际为 ${Object.keys(careers).length} 种`);
expectedKeys.forEach(key => check(Boolean(careers[key]), `缺少职业组合：${key}`));

Object.entries(careers).forEach(([key, career]) => {
  check(career.name.length >= 2, `${key} 缺少职业名称`);
  check(career.declaration.length >= 20, `${career.name} 的命运宣言过短`);
  check(career.intro.length >= 60, `${career.name} 的职业介绍过短`);
  check(career.soul.length >= 180, `${career.name} 的灵魂本质过短`);
  check(career.blessing.length >= 20, `${career.name} 的命运寄语过短`);
  check(fs.existsSync(path.join(root, 'assets', 'cards', career.image)), `${career.name} 缺少源画像 ${career.image}`);
  check(fs.existsSync(path.join(root, 'dist', 'assets', 'cards', career.image)), `${career.name} 缺少发布画像 ${career.image}`);
});

['index.html', 'styles.css', 'overrides.css', 'app-v2.js'].forEach(file => {
  const sourceFile = path.join(root, file);
  const builtFile = path.join(root, 'dist', file);
  check(fs.existsSync(builtFile), `发布目录缺少 ${file}`);
  if (fs.existsSync(builtFile)) {
    check(fs.readFileSync(sourceFile).equals(fs.readFileSync(builtFile)), `源文件与 dist/${file} 不一致`);
  }
});

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
check(html.includes('app-v2.js'), '页面没有引用当前脚本 app-v2.js');
['Ⅰ · 命运宣言', 'Ⅱ · 职业介绍', 'Ⅲ · 灵魂本质', 'Ⅳ · 命运寄语'].forEach(title => {
  check(html.includes(title), `结果页缺少章节：${title}`);
});

if (failures.length) {
  console.error(`质量检查失败（${failures.length} 项）：`);
  failures.forEach(message => console.error(`- ${message}`));
  process.exit(1);
}

console.log('质量检查通过');
console.log(`- ${questions.length} 道题，核心驱动力与关系倾向各 14 道`);
console.log(`- ${Object.keys(careers).length} 种职业组合及画像完整`);
console.log('- 源文件、发布目录与结果页结构一致');

