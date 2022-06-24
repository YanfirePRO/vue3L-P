/**
 *  数据监听的动态结构
 *  target -- property1
 *              -- effect1
 *              -- effect2
 *         -- property2
 *              --effect3
 *              --effect4
 * target2
 */

let bucket = new WeakMap(); //-一个通用的桶

let testdata = {
    value: '100',
    ok: true
}

//- 全局变量保存注册的effect函数
let activeEffect = null;
function effect(fn){
    const effectFn = ()=>{
        cleanup(effectFn)
        activeEffect = effectFn;
        fn()
    }
    
}

//- 抽离track和trigger函数
function track(target, property){
    if(!activeEffect){
        return 
    }
    let depsMap = bucket.get(target);
    if(!depsMap){
        bucket.set(target, depsMap = new Map())
    }
    let deps = depsMap.get(property);
    if(!deps){
        depsMap.set(property, deps = new Set())
    }
    deps.add(activeEffect)
}

//- 分支切换与cleanup
function cleanup(){

}

function trigger(target, property){
    let depsMap = bucket.get(target);
    if(!depsMap){
        return 
    }
    let deps = depsMap.get(property);
    deps && deps.forEach(fn => fn())
}

let dataProxy = new Proxy(testdata, {
    get: (target, property, receiver)=>{
        track(target, property)
        return target[property]
    },
    set: (target, property, value, receiver)=>{
        target[property] = value;
        trigger(target, property);
    }
})

effect(()=>{
    console.log("run effect")
    document.body.innerText = dataProxy.ok ? dataProxy.value : 'not'
})

setTimeout(()=>{
    console.log(`重新设置` + testdata.value)
    dataProxy.value = 200;
}, 2000)