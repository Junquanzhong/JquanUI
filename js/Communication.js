// 子页面与父页面通信示例
function sendMessageToParent(message) {
  window.parent.postMessage(message, window.location.origin);
}

// 监听来自父页面的消息
window.addEventListener('message', function (event) {
  if (event.origin !== window.location.origin) return;
  console.log('收到父页面消息:', event.data);
});

// 导航到其他页面的示例
function navigateTo(page) {
  sendMessageToParent({
    type: 'navigate',
    page: page
  });
}

function copyToClipboard() {
  // 获取当前按钮所在的代码块元素
  const codeBlock = this.closest('.codeblock');

  // 在代码块中找到 pre > code 元素
  const codeElement = codeBlock.querySelector('pre code');

  // 获取代码文本内容
  // 注意：我们需要保留原始文本格式，但去除HTML标签
  let codeText = '';

  // 获取所有行，并保持格式
  const lines = codeElement.querySelectorAll('.line');
  if (lines.length > 0) {
    // 如果有.line元素，从它们中提取文本
    lines.forEach(line => {
      codeText += line.textContent + '\n';
    });
  } else {
    // 否则直接获取code元素的文本
    codeText = codeElement.textContent;
  }

  // 创建临时文本区域
  const el = document.createElement("textarea");
  el.value = codeText.trim(); // 移除多余的空格
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);

  // 保存当前选择
  const selected = document.getSelection().rangeCount > 0
    ? document.getSelection().getRangeAt(0)
    : false;

  // 选择文本并复制
  el.select();
  document.execCommand("copy");

  // 移除临时元素
  document.body.removeChild(el);

  // 恢复原有选择
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }

  // 添加复制成功的反馈
  const button = this;
  const originalText = button.textContent;
  button.textContent = "已复制!";
  setTimeout(() => {
    button.textContent = originalText;
  }, 1500);
}

// 添加事件监听
document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.code-toolbar-button');
  buttons.forEach(button => {
    // 移除可能已有的onclick属性
    button.removeAttribute('onclick');
    // 添加事件监听器
    button.addEventListener('click', copyToClipboard);
  });
});

function setupCopyOnClick() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-copy]');

    if (target) {
      const textToCopy = target.getAttribute('data-copy');

      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          console.log('已复制: ' + textToCopy);

          // 创建提示元素
          const notification = document.createElement('p');
          notification.textContent = '已复制';
          notification.textContent = '已复制';
          notification.style.position = 'absolute';
          notification.style.top = '6px';
          notification.style.left = '50%';
          notification.style.width = '90%'
          notification.style.transform = 'translateX(-50%)';
          notification.style.background = 'rgba(0, 0, 0, 0.6)';
          notification.style.color = 'white';
          notification.style.padding = '4px 8px';
          notification.style.borderRadius = '4px';
          notification.style.fontSize = '12px';
          notification.style.zIndex = '1000';
          notification.style.textAlign = 'center';
          

          // 插入到当前元素内部（相对定位）
          target.style.position = 'relative';
          target.appendChild(notification);

          // 3秒后移除提示
          setTimeout(() => {
            notification.remove();
          }, 3000);
        })
        .catch(err => {
          console.error('复制失败: ', err);
        });
    }
  });
}


function copyFirstClass(element) {
  const firstClass = element.className.split(' ')[0]; // 获取第一个类名

  navigator.clipboard.writeText(firstClass)
    .then(() => {
      console.log('已复制: ' + firstClass);

      // 显示提示
      const notification = document.createElement('p');
      notification.textContent = '已复制';
      notification.style.position = 'absolute';
      notification.style.top = '6px';
      notification.style.left = '50%';
      notification.style.width = '90%'
      notification.style.transform = 'translateX(-50%)';
      notification.style.background = 'rgba(0, 0, 0, 0.6)';
      notification.style.color = 'white';
      notification.style.padding = '4px 8px';
      notification.style.borderRadius = '4px';
      notification.style.fontSize = '12px';
      notification.style.zIndex = '1000';

      element.style.position = 'relative';
      element.appendChild(notification);

      setTimeout(() => notification.remove(), 3000);
    })
    .catch(err => console.error('复制失败: ', err));
}


function replaceThemeClass(event) {
  // 获取触发事件的当前元素（按钮）
  const button = event.currentTarget;

  // 获取当前元素的第一个类名
  const classList = button.classList;
  if (classList.length === 0) {
    console.warn('当前元素没有类名');
    return;
  }
  const firstClass = classList[0];

  // 获取目标元素
  const themeBody = document.getElementById('theme-body');
  if (!themeBody) {
    console.warn('未找到id为"theme-body"的元素');
    return;
  }

  // 移除目标元素中所有以"theme-"开头的类名
  Array.from(themeBody.classList).forEach(className => {
    if (className.startsWith('theme-')) {
      themeBody.classList.remove(className);
    }
  });

  // 添加新的主题类名
  themeBody.classList.add(`${firstClass}`);

  // 显示操作成功的提示
  showSuccessNotification(button, '主题已应用');
}



function showSuccessNotification(element, message) {
  // 检查是否已有提示元素，有则先移除
  const existingNotification = element.querySelector('.theme-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // 创建提示元素
  const notification = document.createElement('p');
  notification.textContent = message;
  notification.className = 'theme-notification'; // 添加类名以便后续查找

  // 设置提示样式
  notification.style.position = 'absolute';
  notification.style.top = '6px';
  notification.style.left = '50%';
  notification.style.width = '90%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.background = 'rgba(0, 0, 0, 0.6)';
  notification.style.color = 'white';
  notification.style.padding = '4px 8px';
  notification.style.borderRadius = '4px';
  notification.style.fontSize = '12px';
  notification.style.zIndex = '1000';
  notification.style.textAlign = 'center';
  notification.style.pointerEvents = 'none'; // 防止提示阻挡按钮点击

  // 确保按钮有相对定位
  element.style.position = 'relative';

  // 添加提示到按钮
  element.appendChild(notification);

  // 3秒后自动移除提示
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

