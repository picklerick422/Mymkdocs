// ============================================
// Material for MkDocs 主题切换动画增强
// 支持多组 palette 配置（自动+手动模式）
// ============================================

(function() {
  'use strict';

  console.log('[ThemeTransition] Script loaded');

  const CONFIG = {
    duration: 500,
    debug: true
  };

  const log = (...args) => CONFIG.debug && console.log('[ThemeTransition]', ...args);
  let isTransitioning = false;

  // 设置过渡状态
  const setTransitioning = (active) => {
    if (active) {
      document.body.classList.add('theme-transitioning');
      document.documentElement.classList.add('theme-transitioning');
      log('Animation started');
    } else {
      document.body.classList.remove('theme-transitioning');
      document.documentElement.classList.remove('theme-transitioning');
      log('Animation ended');
    }
  };

  // 旋转图标
  const rotateIcon = (element) => {
    // 查找图标 - 可能在按钮内，也可能在 label 内
    const icon = element.querySelector('.md-icon, svg, .twemoji') ||
                 element.closest('label')?.querySelector('.md-icon, svg, .twemoji');

    if (!icon) {
      log('No icon found for rotation');
      return null;
    }

    icon.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    icon.style.transform = 'rotate(360deg) scale(1.1)';
    log('Icon rotation started');
    return icon;
  };

  // 重置图标
  const resetIcon = (icon) => {
    if (!icon) return;
    setTimeout(() => {
      icon.style.transition = 'none';
      icon.style.transform = '';
      void icon.offsetHeight;
      icon.style.transition = '';
      log('Icon rotation reset');
    }, CONFIG.duration);
  };

  // 触发动画序列
  const triggerAnimation = (element) => {
    if (isTransitioning) return;

    isTransitioning = true;
    setTransitioning(true);

    const icon = rotateIcon(element);

    setTimeout(() => {
      setTransitioning(false);
      resetIcon(icon);
      isTransitioning = false;
    }, CONFIG.duration);
  };

  // 绑定所有 palette 相关的 radio buttons 和 labels
  const bindPaletteToggles = () => {
    // 1. 绑定所有 radio buttons (input[name="__palette"])
    const radios = document.querySelectorAll('input[name="__palette"]');
    log(`Found ${radios.length} palette radios`);

    radios.forEach((radio, index) => {
      if (radio.dataset.bound) return;
      radio.dataset.bound = 'true';

      radio.addEventListener('change', (e) => {
        if (!e.target.checked) return;
        log(`Radio ${index} (${e.target.id}) changed`);
        triggerAnimation(e.target);
      });
    });

    // 2. 绑定所有相关的 label（点击 label 会触发 radio，但我们需要捕获点击事件做动画）
    const labels = document.querySelectorAll('label[for^="__palette"]');
    log(`Found ${labels.length} palette labels`);

    labels.forEach((label, index) => {
      if (label.dataset.bound) return;
      label.dataset.bound = 'true';

      label.addEventListener('click', (e) => {
        // 检查对应的 radio 是否会被改变（即当前未选中）
        const targetId = label.getAttribute('for');
        const targetRadio = document.getElementById(targetId);

        if (targetRadio && !targetRadio.checked) {
          log(`Label ${index} (for ${targetId}) clicked, will change theme`);
          triggerAnimation(label);
        } else {
          log(`Label ${index} clicked but already active, skipping animation`);
        }
      }, true); // 使用捕获阶段确保在 Material 之前执行
    });

    // 3. 备选：直接查找 header 中的按钮
    const headerButtons = document.querySelectorAll('.md-header__button');
    headerButtons.forEach((btn, index) => {
      if (btn.dataset.bound) return;

      // 检查是否是 palette 相关按钮
      const isPaletteBtn = btn.hasAttribute('data-md-toggle') &&
                           btn.getAttribute('data-md-toggle').includes('palette');
      const hasPaletteFor = btn.hasAttribute('for') &&
                            btn.getAttribute('for').includes('__palette');

      if (isPaletteBtn || hasPaletteFor) {
        btn.dataset.bound = 'true';
        log(`Bound header button ${index}`);

        btn.addEventListener('click', (e) => {
          log('Header palette button clicked');
          triggerAnimation(btn);
        }, true);
      }
    });
  };

  // 监听 body 属性变化（系统主题切换时）
  const observeSchemeChanges = () => {
    let lastScheme = document.body.getAttribute('data-md-color-scheme');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-md-color-scheme') {
          const newScheme = document.body.getAttribute('data-md-color-scheme');
          if (newScheme !== lastScheme && !isTransitioning) {
            log(`Scheme changed from ${lastScheme} to ${newScheme} via observer`);
            lastScheme = newScheme;
            triggerAnimation(document.body);
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });
    log('MutationObserver started, initial scheme:', lastScheme);
  };

  // 初始化
  const init = () => {
    log('Initializing...');
    bindPaletteToggles();
    observeSchemeChanges();

    // 延迟再次检查，确保动态生成的元素也被绑定
    setTimeout(() => {
      const unboundRadios = document.querySelectorAll('input[name="__palette"]:not([data-bound])');
      if (unboundRadios.length > 0) {
        log(`Found ${unboundRadios.length} unbound radios in delayed check`);
        bindPaletteToggles();
      }
    }, 1000);
  };

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
      const labels = document.querySelectorAll('label[for^="__palette"]');
      // 找到当前未选中的那个并点击
      labels.forEach(label => {
        const radio = document.getElementById(label.getAttribute('for'));
        if (radio && !radio.checked) {
          label.click();
        }
      });
    }
  });

})();