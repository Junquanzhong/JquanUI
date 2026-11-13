// JquanUI component documentation: formValidator
export default {
  "id": "formValidator",
  "title": "FormValidator",
  "chinese": "表单校验",
  "category": "表单输入",
  "version": "1.1.0",
  "file": "dist/components/formValidator.js",
  "api": "JquanUIComponents.formValidatorApi",
  "summary": "提供规则注册、字段级校验、整表校验与表单值收集，适合表单弹窗和提交前校验。",
  "install": "await JquanUI.import('formValidator');",
  "declarative": "<form jq-form-validate id=\"demo-form\">\n  <input name=\"email\">\n</form>",
  "imperative": "const form = JquanUIComponents.formValidatorApi.mount('#demo-form', {\n  schema: {\n    email: ['required', 'email']\n  }\n});\n\nawait form.validate();\nawait form.validateField('email');",
  "attrs": [
    [
      "`jq-form-validate` / `data-jq-validate`",
      "声明式入口"
    ],
    [
      "`data-validate-mode`",
      "校验触发模式"
    ],
    [
      "`data-validate-on-input`",
      "输入时校验"
    ],
    [
      "`data-validate-on-blur`",
      "失焦时校验"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "返回稳定句柄；同一 form 重复挂载复用原实例和原选项；同 id 新节点替换并退休旧实例。"
    ],
    [
      "`validate / validateField`",
      "执行校验"
    ],
    [
      "`values(target)`",
      "读取表单值"
    ],
    [
      "`registerRule(name, validator)`",
      "注册自定义规则"
    ],
    [
      "句柄 `get / state / reset / updateSchema / destroy`",
      "get(target) 返回稳定句柄；state() 含 fields、destroyed。reset() 清空状态并使旧异步结果失效；updateSchema(patch) 合并规则并重新绑定字段事件；destroy() 幂等，旧句柄返回 false。"
    ]
  ],
  "notes": [
    "modal 的 form 模式、crud 的编辑弹窗都会依赖它。",
    "无额外组件依赖。target 使用表单元素、选择器或已挂载业务 id；节点寻址按对象身份，不用旧节点 id 命中新实例。自动增强复用已手动 mount 的配置；需要修改规则用 updateSchema，改其他选项先 destroy 再 mount。",
    "异步规则遵循同字段最新请求优先；reset、updateSchema、destroy、同 id 替换使旧结果失效，旧结果不写 DOM、不发校验回调或继续提交。已发起 Promise 仍自行结算，不会物理取消业务网络请求。被淘汰校验返回 valid:false、cancelled:true。",
    "destroy 后 form()/values() 返回 null，reset()/destroy() 返回 false，updateSchema() 返回 null；state().destroyed 为 true。路由卸载时使用自己保存的 handle.destroy()，避免按旧 id 清理替代节点。",
    "默认 nativeValidation:false 会拦截 submit；没有 onSuccess 时有效结果会调用 form.submit()。应用自行提交时必须提供 onSuccess，返回 false；Modal form 已由 Modal 管理提交，业务只配置校验规则。默认 validateOnBlur:true、validateOnInput:false、focusOnError/scrollToError:true。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<form jq-form-validate id=\"demo-form\">\n  <input name=\"email\">\n</form>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const form = JquanUIComponents.formValidatorApi.mount('#demo-form', {\n  schema: {\n    email: ['required', 'email']\n  }\n});\n\nawait form.validate();\nawait form.validateField('email');",
      "preview": false
    },
    {
      "id": "stable-lifecycle",
      "title": "稳定句柄与动态卸载",
      "language": "javascript",
      "code": "const validators = await JquanUI.import('formValidator');\nconst handle = validators.mount('#demo-form', {\n  schema: { email: ['required', 'email'] },\n  onSuccess({ values }) { console.log(values); return false; }\n});\nJquanUI.enhance(document.querySelector('#demo-form')); // 保留原挂载选项\nconsole.log(validators.get('#demo-form') === handle); // true\nhandle.updateSchema({ email: ['required'] });\nconst result = await handle.validate();\nif (!result.cancelled) console.log(result.valid);\n// 路由卸载：handle.destroy();",
      "preview": false
    }
  ]
};
