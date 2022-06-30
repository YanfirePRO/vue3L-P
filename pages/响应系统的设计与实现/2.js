/**
 * 调度执行 scheduler
 */

const data = {
  value: 1,
};

const proxyData = new Proxy(data, {
  get: (target, property, receiver) => {
    track(target, property);
    return target[property];
  },
  set: (target, property, value, receiver) => {
    target[property] = value;
    trigger(target, property);
  },
});

//- 全局变量保存注册的effect函数
let activeEffect = null;

//- 增加options
let effectStack = [];
function effect(fn, options) {
  const effectFn = () => {
    cleanup(effectFn);
    effectStack.push(effectFn);
    activeEffect = effectFn;
    //- fn里注册监听
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };
  effectFn.deps = [];
	effectFn.options = options;
  effectFn();
}

let bucket = new WeakMap();

//- 抽离track和trigger函数
function track(target, property) {
  console.log("track-------", property, activeEffect);
  if (!activeEffect) {
    return;
  }
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(property);
  if (!deps) {
    depsMap.set(property, (deps = new Set()));
  }
  deps.add(activeEffect);
  //- 收集与activeEffect相关的依赖
  activeEffect.deps.push(deps);
  console.log("track-------end");
}

//- 分支切换与cleanup
function cleanup(effect) {
  let deps = effect.deps;
  for (let i = 0; i < deps.length; i++) {
    let depsSet = deps[i];
    depsSet.delete(effect);
  }
  effect.deps.length = 0;
}

function trigger(target, property) {
  console.log("trigger-------", property);
  let depsMap = bucket.get(target);
  if (!depsMap) {
    return;
  }
  //- 新建Set 避免forEach时无限循环
  let deps = new Set();
  //- 判断函数是否为当前正在执行的函数，避免无限循环
  depsMap.get(property).forEach((item) => {
    if (item !== activeEffect) {
      deps.add(item);
    }
  });
  deps && deps.forEach((fn) => {
    if(fn.options && fn.options.scheduler){
      fn.options.scheduler(fn)
    } else {
      fn()
    }
  });
}

effect(()=>{
	console.log('run effect')
	console.log(proxyData.value)
}, {
	scheduler: (fn)=>{
		setTimeout(()=>{
			fn();
		}, 2000)
	}
})

proxyData.value++

console.log("end")
