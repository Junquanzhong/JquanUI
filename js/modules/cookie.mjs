// cookie.mjs
// 本组件逻辑部分由GLM-4.6生成
const defaultOptions = {
  path   : '/',
  domain : '',
  secure : false,
  sameSite : 'Lax'  // 'Strict' | 'Lax' | 'None'
};

const encode = encodeURIComponent;
const decode = decodeURIComponent;

/**
 * 把一个对象序列化成 cookie 属性字符串
 * @param  {Object} opts
 * @return {String}
 */
function serialize(opts = {}) {
  const opt = Object.assign({}, defaultOptions, opts);
  let str = '';

  if (opt.expires) {
    const d = opt.expires instanceof Date
      ? opt.expires
      : new Date(Date.now() + Number(opt.expires) * 1000);
    str += `; Expires=${d.toUTCString()}`;
  }
  if (opt.maxAge != null) str += `; Max-Age=${opt.maxAge}`;
  if (opt.domain)         str += `; Domain=${opt.domain}`;
  if (opt.path)           str += `; Path=${opt.path}`;
  if (opt.secure)         str += "; Secure";
  if (opt.sameSite)       str += `; SameSite=${opt.sameSite}`;
  return str;
}

export const Cookie = {
  /**
   * 根据 key 读取 cookie
   * @param  {String} key
   * @return {String|null}
   */
  get(key) {
    const raw = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${encode(key)}=`));

    return raw ? decode(raw.split('=')[1]) : null;
  },

  /**
   * 设置 cookie
   * @param {String} key
   * @param {*}      value
   * @param {Object} [opts]  额外属性：expires、maxAge、path、domain、secure、sameSite
   */
  set(key, value, opts = {}) {
    const v = encode(String(value)) + serialize(opts);
    document.cookie = `${encode(key)}=${v}`;
    return this; // 可链式
  },

  /**
   * 读取所有 cookie 的键值对
   * @return {Object}
   */
  getAll() {
    return document.cookie
      .split('; ')
      .reduce((acc, cur) => {
        if (!cur) return acc;
        const [k, ...rest] = cur.split('=');
        acc[decode(k)] = decode(rest.join('='));
        return acc;
      }, {});
  },

  /**
   * 根据 key 删除 cookie
   * @param  {String} key
   * @param  {Object} [opts]  path / domain 等必须与原 cookie 一致才能删除
   * @return {Object}         链式
   */
  remove(key, opts = {}) {
    this.set(key, '', Object.assign({}, opts, { maxAge: -1, expires: new Date(0) }));
    return this;
  },

  /**
   * 清空当前域下所有可读到的 cookie（仅删除 path=/ 的 cookie，其余需自行指定）
   */
  clear() {
    Object.keys(this.getAll()).forEach(k => this.remove(k, { path: '/' }));
    return this;
  }
};
