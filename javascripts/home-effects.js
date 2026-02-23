// 首页特效：粒子背景 + 点击特效 + 3D悬浮卡片（全局鼠标追踪 + 弹性回弹版）
(function() {
    // 只在首页执行
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
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

                if (this.mouse.x !== null) {
                    const dx = this.mouse.x - p.x;
                    const dy = this.mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.mouseDistance) {
                        const force = (config.mouseDistance - dist) / config.mouseDistance;
                        p.vx += (dx / dist) * force * 0.02;
                        p.vy += (dy / dist) * force * 0.02;
                    }
                }

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fill();

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
            });

            requestAnimationFrame(() => this.animate());
        }
    }

    // ==================== 点击粒子特效 ====================
    class ClickEffect {
        constructor() {
            this.particles = [];
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

        createExplosion(x, y) {
            const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
            const colors = isDark ? config.colors.dark : config.colors.light;

            for (let i = 0; i < config.clickParticleCount; i++) {
                const angle = (Math.PI * 2 / config.clickParticleCount) * i;
                const velocity = Math.random() * 4 + 2;

                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    life: 1,
                    decay: Math.random() * 0.02 + 0.015,
                    color: colors[Math.floor(Math.random() * colors.length)],
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

            // 点击涟漪效果：使用 CSS 中的 .ripple 动画
            wrapper.addEventListener('click', (e) => {
                const rect = wrapper.getBoundingClientRect();

                const ripple = document.createElement('span');
                ripple.className = 'ripple';

                const size = Math.max(rect.width, rect.height) * 1.4;
                ripple.style.width = `${size}px`;
                ripple.style.height = `${size}px`;

                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                wrapper.appendChild(ripple);

                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });
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

            // 内部元素微移增强立体感
            const innerOffset = card.isHovering ? 30 : 0;
            card.inner.style.transform = `translateZ(${innerOffset}px)`;
        }
    }

    // ==================== 初始化 ====================
    document.addEventListener('DOMContentLoaded', () => {
        new ParticleBackground();
        new ClickEffect();
        new FloatingCards();
    });
})();