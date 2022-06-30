/**
 * 数据监听 --- track/trigger --- 嵌套effect --- trigger剔除正在执行函数（无限循环）
 * /



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
 // function effect(fn){
 //     const effectFn = ()=>{
 //         cleanup(effectFn)
 //         activeEffect = effectFn;
 //         fn()
 //     }
 //     effectFn.deps = []
 //     effectFn()
 // }
 
 //- 兼容嵌套的effect函数
 let effectStack = []
 function effect(fn){
     const effectFn = () => {
         cleanup(effectFn);
         effectStack.push(effectFn);
         activeEffect = effectFn;
         //- fn里注册监听
         fn();
         effectStack.pop()
         activeEffect = effectStack[effectStack.length - 1]
 
     }
     effectFn.deps = []
     effectFn()
 }
 
 //- 抽离track和trigger函数
 function track(target, property){
     console.log("track-------", property, activeEffect)
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
     //- 收集与activeEffect相关的依赖
     activeEffect.deps.push(deps)
     console.log("track-------end")
 }
 
 //- 分支切换与cleanup
 function cleanup(effect){
     let deps = effect.deps;
     for(let i=0;i<deps.length;i++){
         let depsSet = deps[i];
         depsSet.delete(effect)
     }
     effect.deps.length = 0;
 }
 
 function trigger(target, property){
     console.log("trigger-------", property)
     let depsMap = bucket.get(target);
     if(!depsMap){
         return 
     }
     //- 新建Set 避免forEach时无限循环
     let deps = new Set();
     //- 判断函数是否为当前正在执行的函数，避免无限循环
     depsMap.get(property).forEach((item)=>{
         if(item !== activeEffect){
             deps.add(item)
         }
     })
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
 
 // effect(()=>{
 //     console.log("run effect")
 //     document.body.innerText = dataProxy.ok ? dataProxy.value : 'not'
 // })
 
 // setTimeout(()=>{
 //     dataProxy.ok = false;
 //     dataProxy.value = 200;
 //     console.log(bucket, 'bucket')
 // }, 2000)
 
 /** 
  * 在vue中, render函数就是在effect中执行，比如<Foo />组件，以及他的子组件<Boo />
  * effect(()=>{
  *   Foo.render()
  * })
  * 
  * //- 渲染Boo会发生嵌套
  * effect(()=>{
  *   Foo.render()
  *   effect(()=>{
  *     Boo.render()  
  *   })
  * })
 */
 
 const renderData = {
     foo: 1,
     bar: true
 }
 
 let renderDataProxy = new Proxy(renderData, {
     get: (target, property, receiver)=>{
         track(target, property)
         return target[property]
     },
     set: (target, property, value, receiver)=>{
         target[property] = value;
         trigger(target, property);
     }
 })
 
 // let temp1, temp2
 
 // effect(()=>{
 //     console.log('fn1');
 //     effect(()=>{
 //         console.log('fn2')
 //         temp2 = renderDataProxy.bar
 //     })
 //     temp1 = renderDataProxy.foo
 // })
 
 // setTimeout(()=>{
 //     renderDataProxy.foo = 2
 // }, 2000)
 
 //- 避免无限循环
 effect(()=>{
     console.log('effect---start')
     renderDataProxy.foo++
     console.log('effect---end')
 })