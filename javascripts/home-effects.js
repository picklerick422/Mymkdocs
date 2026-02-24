// 首页特效：粒子背景 + 点击特效 + 3D悬浮卡片（全局鼠标追踪 + 弹性回弹版）
(function() {
    // 在全局执行（仅检查内容区域是否存在）
    if (!document.querySelector('.md-content__inner')) {
        return;
    }

    // ==================== 配置项 ====================
    const config = {
        particleCount: 60,
        connectionDistance: 150,
        mouseDistance: 200,
        clickParticleCount: 12,
        colors: {
            light: ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6'],
            dark: ['#818cf8', '#a78bfa', '#f472b6', '#60a5fa']
        }
    };

    // ==================== Canvas 背景 ====================
    class ParticleBackground {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particle-canvas';
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: null, y: null };
            this.isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';

            this.init();
        }

        init() {
            Object.assign(this.canvas.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: '-1',
                pointerEvents: 'none',
                opacity: '0.6'
            });

            document.body.insertBefore(this.canvas, document.body.firstChild);

            this.resize();
            this.createParticles();
            this.bindEvents();
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createParticles() {
            this.particles = [];
            const colors = this.isDark ? config.colors.dark : config.colors.light;

            for (let i = 0; i < config.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: Math.random() * 0.5 + 0.3
                });
            }
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            const observer = new MutationObserver(() => {
                const newIsDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
                if (newIsDark !== this.isDark) {
                    this.isDark = newIsDark;
                    this.createParticles();
                }
            });
            observer.observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach((p, i) => {
                // 位置更新
                p.x += p.vx;
                p.y += p.vy;

                // 边界反弹
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

                let mouseDist = null;

                // 鼠标吸引：一定范围内被鼠标“吸过去”
                if (this.mouse.x !== null) {
                    const dx = this.mouse.x - p.x;
                    const dy = this.mouse.y - p.y;
                    mouseDist = Math.sqrt(dx * dx + dy * dy);

                    if (mouseDist < config.mouseDistance && mouseDist > 0.001) {
                        const force = (config.mouseDistance - mouseDist) / config.mouseDistance;
                        const strength = 0.12; // 吸引强度
                        const nx = dx / mouseDist;
                        const ny = dy / mouseDist;

                        p.vx += nx * force * strength;
                        p.vy += ny * force * strength;
                    }
                }

                // 绘制粒子
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fill();

                // 粒子之间连线
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.connectionDistance) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = p.color;
                        this.ctx.globalAlpha = (1 - dist / config.connectionDistance) * 0.2;
                        this.ctx.stroke();
                    }
                }

                // 粒子与鼠标连线
                if (this.mouse.x !== null && mouseDist !== null && mouseDist < config.mouseDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.strokeStyle = p.color;
                    this.ctx.globalAlpha = (1 - mouseDist / config.mouseDistance) * 0.4;
                    this.ctx.stroke();
                }
            });

            requestAnimationFrame(() => this.animate());
        }
    }

    // ==================== 点击粒子特效 ====================
    class ClickEffect {
        constructor() {
            this.particles = [];
            // 暴露给其他特效使用（如点赞烟花）
            window.__pageClickEffect = this;
            this.bindEvents();
            this.animate();
        }

        bindEvents() {
            document.addEventListener('click', (e) => {
                this.createExplosion(e.clientX, e.clientY);
            });

            document.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                this.createExplosion(touch.clientX, touch.clientY);
            });
        }

        createExplosion(x, y, options = {}) {
            const { multiplier = 1, upwardBias = false, mainHue } = options;
            const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
            const colors = isDark ? config.colors.dark : config.colors.light;

            const count = Math.max(6, Math.floor(config.clickParticleCount * multiplier));

            const pickColor = () => {
                if (mainHue !== undefined && mainHue !== null) {
                    // 主体颜色与光条一致，饱和度/亮度微调增加层次
                    const s = 80 + Math.random() * 20;
                    const l = isDark ? 55 + Math.random() * 25 : 50 + Math.random() * 25;
                    return `hsl(${mainHue}, ${s}%, ${l}%)`;
                }
                return colors[Math.floor(Math.random() * colors.length)];
            };

            for (let i = 0; i < count; i++) {
                let angle;
                if (upwardBias) {
                    // 上半圆范围内随机角度（主要向上发散）
                    angle = -Math.PI + Math.random() * Math.PI;
                } else {
                    angle = (Math.PI * 2 / count) * i;
                }
                const velocity = Math.random() * 4 + 3;

                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    life: 1,
                    decay: Math.random() * 0.02 + 0.015,
                    color: pickColor(),
                    size: Math.random() * 4 + 2
                });
            }
        }

        animate() {
            if (this.particles.length === 0) {
                requestAnimationFrame(() => this.animate());
                return;
            }

            let canvas = document.getElementById('click-canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = 'click-canvas';
                Object.assign(canvas.style, {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: '9999'
                });
                document.body.appendChild(canvas);
            }

            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1;
                p.life -= p.decay;

                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ==================== 3D 悬浮卡片效果（全局鼠标追踪 + 弹性回弹版）====================
    class FloatingCards {
        constructor() {
            this.cards = [];
            this.mouse = { x: 0, y: 0 };
            this.init();
        }

        init() {
            // 全局鼠标追踪
            this.bindGlobalMouseTracking();

            // 初始化所有卡片
            const selectors = [
                '.md-content__inner img',
                '.md-typeset img',
                '.hero-image',
                '[data-tilt]'
            ];

            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (!el.closest('.tilt-card')) {
                        this.make3DCard(el);
                    }
                });
            });
        }

        bindGlobalMouseTracking() {
            let ticking = false;

            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;

                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateAllCards();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            document.addEventListener('mouseleave', () => {
                this.cards.forEach(card => this.releaseCard(card));
            });
        }

        make3DCard(element) {
            // 创建包装容器
            const wrapper = document.createElement('div');
            wrapper.className = 'tilt-card';

            // 将原元素包装起来
            if (element.parentNode) {
                element.parentNode.insertBefore(wrapper, element);
                wrapper.appendChild(element);
            }

            element.classList.add('tilt-card-inner');

            // 创建光影层（大小会跟随wrapper）
            const glare = document.createElement('div');
            glare.className = 'card-glare';
            wrapper.appendChild(glare);

            const cardData = {
                element: wrapper,
                inner: element,
                glare: glare,
                rect: wrapper.getBoundingClientRect(),
                isHovering: false,
                currentRotateX: 0,
                currentRotateY: 0,
                targetRotateX: 0,
                targetRotateY: 0,
                spring: null
            };

            this.cards.push(cardData);

            // 鼠标进入/离开事件
            wrapper.addEventListener('mouseenter', () => {
                cardData.isHovering = true;
                cardData.spring = null; // 停止弹簧动画
                wrapper.classList.add('is-hovering');
                wrapper.classList.remove('is-releasing');
            });

            wrapper.addEventListener('mouseleave', () => {
                cardData.isHovering = false;
                wrapper.classList.remove('is-hovering');
                this.releaseCard(cardData);
            });


            // 更新位置信息
            const updateRect = () => {
                cardData.rect = wrapper.getBoundingClientRect();
            };

            window.addEventListener('scroll', updateRect, { passive: true });
            window.addEventListener('resize', updateRect);
            updateRect();
        }

        updateAllCards() {
            this.cards.forEach(card => {
                if (card.isHovering) {
                    this.updateCardTransform(card);
                } else if (card.spring) {
                    this.updateSpringAnimation(card);
                }
            });
        }

        updateCardTransform(card) {
            const rect = card.rect;
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // 计算鼠标相对于卡片中心的位置（全局坐标）
            const deltaX = this.mouse.x - centerX;
            const deltaY = this.mouse.y - centerY;

            // 基于整个窗口计算旋转角度，距离越远影响越小
            const maxDistance = Math.max(window.innerWidth, window.innerHeight) / 2;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const influence = Math.max(0, 1 - distance / maxDistance);

            // 最大旋转角度 35 度
            const maxRotate = 35;
            const rotateY = (deltaX / (window.innerWidth / 2)) * maxRotate * influence;
            const rotateX = -(deltaY / (window.innerHeight / 2)) * maxRotate * influence;

            card.targetRotateX = rotateX;
            card.targetRotateY = rotateY;

            // 平滑插值（缓动效果）
            const smoothing = 0.2;
            card.currentRotateX += (rotateX - card.currentRotateX) * smoothing;
            card.currentRotateY += (rotateY - card.currentRotateY) * smoothing;

            // 应用变换
            this.applyTransform(card);

            // 更新光影位置（相对于卡片表面）
            const glareX = 50 + (deltaX / rect.width) * 30;
            const glareY = 50 + (deltaY / rect.height) * 30;
            card.glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)`;
            card.glare.style.opacity = Math.min(influence * 1.5, 1).toString();
        }

        releaseCard(card) {
            // 初始化弹簧物理参数
            card.spring = {
                tension: 0.08,    // 弹簧刚度
                friction: 0.8,   // 摩擦系数（阻尼）
                velocityX: card.currentRotateY * 0.7,  // 初始速度（带方向）
                velocityY: -card.currentRotateX * 0.7,
                threshold: 0.01   // 停止阈值
            };

            card.element.classList.add('is-releasing');
        }

        updateSpringAnimation(card) {
            if (!card.spring) return;

            const spring = card.spring;

            // 胡克定律：F = -k * x
            const forceX = -spring.tension * card.currentRotateY;
            const forceY = -spring.tension * card.currentRotateX;

            // 更新速度：v += F
            spring.velocityX += forceX;
            spring.velocityY += forceY;

            // 应用阻尼：v *= friction
            spring.velocityX *= spring.friction;
            spring.velocityY *= spring.friction;

            // 更新位置：x += v
            card.currentRotateY += spring.velocityX;
            card.currentRotateX += spring.velocityY;

            // 应用变换
            this.applyTransform(card);

            // 渐隐光影
            const currentOpacity = parseFloat(card.glare.style.opacity || 0);
            card.glare.style.opacity = Math.max(0, currentOpacity - 0.03).toString();

            // 停止条件：速度和位置都足够小
            const speed = Math.sqrt(spring.velocityX ** 2 + spring.velocityY ** 2);
            const displacement = Math.sqrt(card.currentRotateX ** 2 + card.currentRotateY ** 2);

            if (speed < spring.threshold && displacement < spring.threshold) {
                card.currentRotateX = 0;
                card.currentRotateY = 0;
                card.spring = null;
                card.element.classList.remove('is-releasing');
                this.applyTransform(card);
                card.glare.style.opacity = '0';
            }
        }

        applyTransform(card) {
            const scale = card.isHovering ? 1.05 : 1;
            const transform = `
                perspective(1000px)
                rotateX(${card.currentRotateX}deg)
                rotateY(${card.currentRotateY}deg)
                scale3d(${scale}, ${scale}, 1)
            `;

            card.element.style.transform = transform;
            // 确保变换原点居中
            card.element.style.transformOrigin = 'center center';

            // 内部元素微移增强立体感
            const innerOffset = card.isHovering ? 30 : 0;
            card.inner.style.transform = `translateZ(${innerOffset}px)`;
            // 确保内部元素的变换原点也居中
            card.inner.style.transformOrigin = 'center center';
        }
    }

    // ==================== about 页点赞烟花按钮 ====================
    function initSupportFireworks() {
        const btn = document.getElementById('support-fireworks');
        if (!btn) return;

        let isTube = false;

        btn.classList.add('support-fireworks-ready');

        btn.addEventListener('click', (event) => {
            event.preventDefault();

            if (!isTube) {
                isTube = true;
                btn.classList.add('support-fireworks--tube');
                btn.textContent = '点我发射烟花';
                return;
            }

            // tube 状态：每次点击都可以再发一轮烟花
            btn.classList.add('support-fireworks--launched');
            btn.textContent = '烟花发射中...';

            createFireworksFromButton(btn, () => {
                btn.classList.remove('support-fireworks--launched');
                btn.textContent = '再来一波烟花';
            });
        });
    }

    function createFireworksFromButton(button, onDone) {
        const rect = button.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top;

        const effect = window.__pageClickEffect;
        if (!effect) {
            if (typeof onDone === 'function') onDone();
            return;
        }

        // 随机高度、光条长度、光点大小、颜色与轻微水平偏移
        const randomHeight = 180 + Math.random() * 140; // 180 - 320
        const randomBarLength = 12 + Math.random() * 18; // 12 - 30px 光条长度
        const randomDotSize = 3.5 + Math.random() * 2.5; // 3.5 - 6px 光点大小
        const randomHue = Math.floor(Math.random() * 360);
        const horizontalOffset = (Math.random() - 0.5) * 60; // 左右最多 30px 偏移

        // DOM 层：承载上升的竖直光条
        const layer = document.createElement('div');
        layer.className = 'support-fireworks-layer';
        document.body.appendChild(layer);

        const firework = document.createElement('div');
        firework.className = 'support-fireworks-firework';
        firework.style.left = `${originX + horizontalOffset}px`;
        firework.style.top = `${originY}px`;
        firework.style.setProperty('--fx-hue', randomHue);
        firework.style.setProperty('--fx-height', `${randomHeight}px`);
        firework.style.setProperty('--fx-length', `${randomBarLength}px`);
        firework.style.setProperty('--fx-dot', `${randomDotSize}px`);
        layer.appendChild(firework);

        let exploded = false;
        const explode = () => {
            if (exploded) return;
            exploded = true;

            const apexY = originY - randomHeight;
            const explosionX = originX + horizontalOffset;

            const explosionMultiplier = 2.2 + Math.random() * 1.8; // 2.2 - 4.0：粒子略多一些，范围更大
            const upwardBias = Math.random() < 0.4; // 偶尔稍微偏向上方

            effect.createExplosion(explosionX, apexY, {
                multiplier: explosionMultiplier,
                upwardBias,
                mainHue: randomHue
            });

            layer.remove();
        };

        const onAnimEnd = (e) => {
            // 等到 hold 动画结束（也就是“收缩成光点”完成）才爆炸
            if (e.animationName !== 'support-fireworks-hold') return;
            firework.removeEventListener('animationend', onAnimEnd);
            explode();
        };
        firework.addEventListener('animationend', onAnimEnd);

        // 提前回调，不等待上升动画结束，使连续点击更顺畅
        const RECOIL_MS = 220;
        setTimeout(() => {
            if (typeof onDone === 'function') onDone();
        }, RECOIL_MS);
    }

    // ==================== 顶部标题栏动效装饰 ====================
    class HeaderEffects {
        constructor() {
            this.header = null;
            this.layer = null;
            this.sprinkles = [];
            this.resizeRaf = null;

            this.init();
        }

        init() {
            const header = document.querySelector('.md-header');
            if (!header) return;

            // 避免重复注入（例如页面局部刷新/脚本重复执行）
            if (header.querySelector('.md-header-effects')) return;

            this.header = header;
            header.setAttribute('data-header-effects', '1');

            const layer = document.createElement('div');
            layer.className = 'md-header-effects';
            layer.setAttribute('aria-hidden', 'true');
            header.appendChild(layer);
            this.layer = layer;

            // 渐变光斑（固定数量，CSS 动画为主）
            const orbs = [
                { className: 'md-header-orb orb-1' },
                { className: 'md-header-orb orb-2' },
                { className: 'md-header-orb orb-3' }
            ];
            orbs.forEach(o => {
                const el = document.createElement('div');
                el.className = o.className;
                layer.appendChild(el);
            });

            // 星点：少量随机分布，低成本增强“活性”
            this.rebuildSprinkles();
            window.addEventListener('resize', () => this.onResize(), { passive: true });
        }

        onResize() {
            if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
            this.resizeRaf = requestAnimationFrame(() => {
                this.rebuildSprinkles();
                this.resizeRaf = null;
            });
        }

        rebuildSprinkles() {
            if (!this.layer) return;

            // 清空旧的
            this.sprinkles.forEach(el => el.remove());
            this.sprinkles = [];

            // prefers-reduced-motion 下保持静态（不生成额外元素）
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }

            const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
            const count = isMobile ? 10 : 18;

            for (let i = 0; i < count; i++) {
                const s = document.createElement('span');
                s.className = 'md-header-sparkle';

                // 位置：避开左侧 logo 的常见区域（0~18%），以及右侧按钮密集区（92~100%）
                const x = 18 + Math.random() * 74; // 18% - 92%
                const y = 10 + Math.random() * 80; // 10% - 90%

                const size = (Math.random() * 1.6 + 1.0).toFixed(2); // 1.0 - 2.6px
                const delay = (Math.random() * 4).toFixed(2); // 0 - 4s
                const duration = (Math.random() * 3 + 2.2).toFixed(2); // 2.2 - 5.2s

                s.style.left = `${x}%`;
                s.style.top = `${y}%`;
                s.style.width = `${size}px`;
                s.style.height = `${size}px`;
                s.style.animationDelay = `${delay}s`;
                s.style.animationDuration = `${duration}s`;

                this.layer.appendChild(s);
                this.sprinkles.push(s);
            }
        }
    }

    // ==================== 初始化 ====================
    document.addEventListener('DOMContentLoaded', () => {
        new ParticleBackground();
        new ClickEffect();
        new FloatingCards();
        initSupportFireworks();
        new HeaderEffects();
    });
})();