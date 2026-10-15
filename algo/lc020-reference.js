// ⚠️⚠️ AI 给的【对照版】（不是你的交付物）—— 你重写的那份才进 `algo/lc020-valid-parentheses.js`
//
// 规矩照旧：**直接粘贴判不合格** —— 先跑一遍 → 逐行看懂 → **合上** → 自己重写。
// 记账三列里写明：这段是 AI 给的对照版。
//
// 思路（就是那三句）：
//   ① 开括号 → 压栈（"记住，我还开着"）
//   ② 闭括号 → 栈顶必须是它的另一半：是 → pop；不是（或栈空）→ 直接 false
//   ③ 扫完 → 栈必须是空的
//
// 复杂度：时间 O(n)、空间 O(n)。**为什么不是 O(n²)**：一遍扫，每个字符只进出栈各一次。

const PAIRS = { ')': '(', ']': '[', '}': '{' }; // 闭 → 开：键是右括号，值是"它必须配上的那个左括号"
const OPENERS = new Set(['(', '[', '{']); // 三个开括号，用来一眼分出"这是开还是闭"

var isValid = function (s) {
  const stack = []; // 栈本体：JS 里就用数组，push/pop/at(-1) 三个动作

  for (const ch of s) {
    // 一遍扫，每个字符只看一眼
    if (OPENERS.has(ch)) {
      // 是开括号
      stack.push(ch); // → 记住"它还没被关上"
      continue; // → 这个字符处理完了，看下一个
    }

    // 走到这儿 = 闭括号（本题只有这 6 种字符）
    if (stack.length === 0) return false; // 边界①：栈空却来了闭括号 → 没有开括号能配它

    const top = stack.at(-1); // 看栈顶 = 最近的"还没关上"的开括号
    if (top !== PAIRS[ch]) return false; // 配不上（例：栈顶是 ( 却来了 ]）→ 顺序错，直接死
    stack.pop(); // 配上了 → 把它拿走（你自己的说法："隔离出去，不要再检索"）
  }

  return stack.length === 0; // 边界②：扫完还有剩 = 有开括号一直没关上 → false
};

module.exports = { isValid };

// 自测：node algo/lc020-reference.js
if (require.main === module) {
  const cases = [
    ['()', true],
    ['', true],
    ['([)]', false], // ★ 这题的"牙"：只数个数/只看奇偶的实现会在这条上翻车
    ['{[]}', true],
    ['(', false], // 边界②
    [')', false], // 边界①
    ['()[]{}', true],
    ['(]', false],
  ];
  for (const [s, want] of cases) {
    const got = isValid(s);
    console.log(`${got === want ? '✓' : '✗'} isValid(${JSON.stringify(s)}) = ${got}（期望 ${want}）`);
  }
}
