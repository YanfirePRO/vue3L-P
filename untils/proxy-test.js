/** Proxy 示例：逻辑分离的数据格式验证器 */
const target = {
    _id: '1024',
    name: 'vuejs'
}

const validators = {
    name(val){
        return typeof val === 'string'
    },
    _id(val){
        return typeof val === 'number' && val > 1024;
    }
}

const createValidator = (target, validator) => {
    return new Proxy(target, {
        _validator: validator,
        set(target, propkey, value, proxy){
            let validator = this._validator[propkey](value);
            if(validator){
                return Reflect.set(target, propkey, value, proxy)
            } else {
                throw Error(`Cannot set ${propkey} to ${value}.Invalid type`)
            }
        }
    })
}

const proxy = createValidator(target, validators);
proxy.name = 'vuejs.com'
proxy._id = 10086

/** proxy 实现私有属性拦截 */
const privateProtect = ( target ) => {
    return new Proxy(target, {
        get(target, propkey, proxy){
            if(propkey[0] === '_'){
                throw Error(`${propkey} is restricted`)
            }
            return Reflect.get(target, propkey, proxy)
        },
        set(target, propkey, value, proxy){
            if(propkey[0] === '_'){
                throw Error(`${propkey} is restricted`)
            }
            return Reflect.set(target, propkey, value, proxy)
        }
    })
}

const proxyProtect = privateProtect(target);
