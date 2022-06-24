/** set 实现 去重 交集 并集 差集 */
let a = [1,1,2,3,4]
let b = [3,4,5,6]

//- 去重
let res1 = [...new Set(a)]

//- 交集
let sA = new Set(a);
let sB = new Set(b);
let res2 = [...a.filter(x => sB.has(x))]

//- 并集
let res3 = [...new Set(a, b)]

//- 差集
let res4 = [...a.filter(x => !sB.has(x))]