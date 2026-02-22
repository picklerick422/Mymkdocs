document.querySelectorAll('.zoom').forEach(item => {
    item.addEventListener('click', function () {
        this.classList.toggle('image-zoom-large');
    })
});

// 预览效果（可选）
const setupPreview = () => {
  const toggle = document.querySelector('[data-md-toggle="palette"]');
  if (!toggle) return;

  let previewTimeout;

  toggle.addEventListener('mouseenter', () => {
    // 悬停 1.5 秒后短暂预览另一种主题
    previewTimeout = setTimeout(() => {
      document.body.style.filter = 'invert(0.05)';
    }, 1500);
  });

  toggle.addEventListener('mouseleave', () => {
    clearTimeout(previewTimeout);
    document.body.style.filter = '';
  });
};