/**
 * カードエフェクト
 */

class CardEffects {
    constructor(scene) {
        this.scene = scene;
        this.effects = {
            fire: null,
            sparkle: null,
            lightning: null,
            glow: null
        };
        this.activeEffect = null;
        this.clock = new THREE.Clock();
        this.textureLoader = new THREE.TextureLoader();
        this.particleGroups = [];
    }

    // エフェクトの初期化
    async init() {
        try {
            // 各エフェクト用のテクスチャをプリロード
            await Promise.all([
                this.loadTexture('fire'),
                this.loadTexture('sparkle'),
                this.loadTexture('lightning')
            ]);
        } catch (error) {
            console.error('エフェクトテクスチャの読み込みエラー:', error);
        }
    }

    // テクスチャの読み込み
    loadTexture(type) {
        return new Promise((resolve, reject) => {
            const path = `assets/textures/${type}_particle.png`;
            this.textureLoader.load(
                path,
                texture => {
                    this.effects[type + 'Texture'] = texture;
                    resolve(texture);
                },
                undefined,
                error => {
                    console.warn(`${type}テクスチャの読み込みに失敗しました:`, error);
                    // エラーでも処理を継続
                    resolve(null);
                }
            );
        });
    }

    // エフェクトの設定
    setEffect(effectType, foregroundMesh, backgroundMesh) {
        // 以前のエフェクトがあれば削除
        this.clearEffect();

        if (!effectType || effectType === 'none') {
            return;
        }

        // エフェクトの種類に応じて処理を分岐
        switch (effectType) {
            case 'fire':
                this.setFireEffect(foregroundMesh, backgroundMesh);
                break;
            case 'sparkle':
                this.createSparkleEffect(foregroundMesh, backgroundMesh);
                break;
            case 'lightning':
                this.createLightningEffect(foregroundMesh, backgroundMesh);
                break;
            case 'glow':
                this.createGlowEffect(foregroundMesh, backgroundMesh);
                break;
        }
    }

    // エフェクトのアニメーション更新
    update() {
        const delta = this.clock.getDelta();
        
        // アクティブなエフェクトがあれば更新
        if (this.activeEffect && this.activeEffect.update) {
            this.activeEffect.update(delta);
        }
    }

    // エフェクトのクリア
    clearEffect() {
        if (this.activeEffect) {
            if (this.activeEffect.mesh) {
                this.scene.remove(this.activeEffect.mesh);
            }
            
            // パーティクルグループを削除
            if (this.particleGroups.length > 0) {
                for (const particles of this.particleGroups) {
                    this.scene.remove(particles);
                }
                this.particleGroups = [];
            }
            
            if (this.activeEffect.light) {
                this.scene.remove(this.activeEffect.light);
            }
            
            if (this.activeEffect.clear) {
                this.activeEffect.clear();
            }
            
            this.activeEffect = null;
        }
    }

    // 仮実装（後で実装します）
    setFireEffect(foregroundMesh, backgroundMesh) {
        this.clearEffect();
        console.log("Fire effect initialized");
        
        // 炎の粒子数
        const particleCount = 200;
        
        // 炎のパーティクル用の配列
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const lifetimes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);
        
        // 炎のテクスチャを作成
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 丸いグラデーションを作成
        const gradient = ctx.createRadialGradient(
            32, 32, 0,
            32, 32, 32
        );
        gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 180, 100, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 100, 50, 0.4)');
        gradient.addColorStop(1, 'rgba(180, 50, 10, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        // パーティクルの初期化
        for (let i = 0; i < particleCount; i++) {
            this.initFireParticle(i, positions, colors, sizes, lifetimes, velocities);
        }
        
        // ジオメトリの作成
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // マテリアルの作成
        const material = new THREE.PointsMaterial({
            size: 1,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            vertexColors: true,
            sizeAttenuation: true
        });
        
        // ポイントクラウドの作成
        const particles = new THREE.Points(geometry, material);
        particles.position.z = 2;
        particles.rotation.x = Math.PI / 2; // 水平に配置
        this.scene.add(particles);
        
        // 光源追加
        const fireLight = new THREE.PointLight(0xff6030, 1.5, 15);
        fireLight.position.set(0, 0, 4);
        this.scene.add(fireLight);
        
        // アクティブなエフェクトとして登録
        this.activeEffect = {
            particles: particles,
            light: fireLight,
            positions: positions,
            colors: colors,
            sizes: sizes,
            lifetimes: lifetimes,
            velocities: velocities,
            particleCount: particleCount,
            update: (delta) => {
                const time = this.clock.elapsedTime;
                
                // 光の強度を変化
                fireLight.intensity = 1.5 + Math.sin(time * 5) * 0.3;
                
                // 各パーティクルを更新
                for (let i = 0; i < particleCount; i++) {
                    // ライフタイムを減少
                    lifetimes[i] -= delta * 0.8;
                    
                    // ライフタイムが尽きたらリセット
                    if (lifetimes[i] <= 0) {
                        this.initFireParticle(i, positions, colors, sizes, lifetimes, velocities);
                        continue;
                    }
                    
                    // 位置の更新
                    positions[i * 3] += velocities[i * 3] * delta;
                    positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
                    positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;
                    
                    // 上に行くほど速度が加速（炎の先端ほど速く動く）
                    velocities[i * 3 + 2] += delta * 0.5;
                    
                    // 揺らぎを追加
                    velocities[i * 3] += (Math.random() - 0.5) * delta * 0.3;
                    velocities[i * 3 + 1] += (Math.random() - 0.5) * delta * 0.3;
                    
                    // ライフタイムに応じて色を変化（黄色→オレンジ→赤→透明）
                    const lifeRatio = lifetimes[i]; // 1.0から0.0へ
                    
                    // 色の調整
                    colors[i * 3] = Math.min(1.0, 0.8 + lifeRatio * 0.2); // 赤
                    colors[i * 3 + 1] = Math.max(0.0, lifeRatio * 0.8); // 緑
                    colors[i * 3 + 2] = Math.max(0.0, lifeRatio * 0.4 - 0.2); // 青
                    
                    // サイズの調整
                    sizes[i] = Math.max(0.1, lifeRatio * 0.8);
                }
                
                // バッファの更新
                particles.geometry.attributes.position.needsUpdate = true;
                particles.geometry.attributes.color.needsUpdate = true;
                particles.geometry.attributes.size.needsUpdate = true;
            },
            clear: () => {
                this.scene.remove(particles);
                this.scene.remove(fireLight);
            }
        };
    }
    
    // 炎のパーティクルを初期化
    initFireParticle(i, positions, colors, sizes, lifetimes, velocities) {
        // パーティクルの初期位置をランダムに設定（カードの下部付近）
        const radius = 2.5 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = -2 + Math.random() * 0.5;
        
        // 色の初期化（黄色〜オレンジ）
        colors[i * 3] = 1.0;     // 赤
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; // 緑
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.2; // 青
        
        // サイズをランダムに設定
        sizes[i] = 0.5 + Math.random() * 0.5;
        
        // ライフタイムを設定
        lifetimes[i] = 0.5 + Math.random() * 0.5;
        
        // 速度を設定
        velocities[i * 3] = (Math.random() - 0.5) * 0.5;     // x方向
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // y方向
        velocities[i * 3 + 2] = 1 + Math.random() * 1.5;     // z方向（上向き）
    }

    // キラキラエフェクトを作成
    createSparkleEffect(foregroundMesh, backgroundMesh) {
        this.clearEffect();
        console.log("Sparkle effect initialized");
        
        const particleCount = 100;
        const particles = new THREE.Group();
        this.particleGroups.push(particles);
        
        // テクスチャが利用可能ならそれを使用、なければプログラムで生成
        let texture;
        if (this.effects.sparkleTexture) {
            texture = this.effects.sparkleTexture;
        } else {
            // キラキラエフェクトのテクスチャを生成
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            // 星形を描画
            ctx.fillStyle = 'white';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const x = 32 + Math.cos(angle) * 30;
                const y = 32 + Math.sin(angle) * 30;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                // 内側の点も追加
                const innerAngle = angle + Math.PI / 5;
                const innerX = 32 + Math.cos(innerAngle) * 12;
                const innerY = 32 + Math.sin(innerAngle) * 12;
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            
            // グロー効果を追加
            const gradient = ctx.createRadialGradient(32, 32, 10, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.globalCompositeOperation = 'lighten';
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
            
            texture = new THREE.CanvasTexture(canvas);
        }
        
        // スパークル粒子の生成と配置
        for (let i = 0; i < particleCount; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                color: new THREE.Color(
                    0.8 + Math.random() * 0.2,
                    0.8 + Math.random() * 0.2,
                    0.9 + Math.random() * 0.1
                ),
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const sprite = new THREE.Sprite(spriteMaterial);
            
            // ランダムな位置（カード周辺）
            const radius = 4 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;
            sprite.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                -1 + Math.random() * 4
            );
            
            // ランダムなサイズ
            const scale = 0.05 + Math.random() * 0.15;
            sprite.scale.set(scale, scale, scale);
            
            // アニメーションのためのプロパティ
            sprite.userData = {
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                blinkSpeed: 0.5 + Math.random() * 2,
                blinkTime: Math.random() * Math.PI * 2,
                moveSpeed: 0.2 + Math.random() * 0.5,
                moveAngle: Math.random() * Math.PI * 2
            };
            
            particles.add(sprite);
        }
        
        this.scene.add(particles);
        
        // アンビエントライトを少し強くして全体を明るく
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        this.activeEffect = {
            particles: particles,
            light: ambientLight,
            update: (delta) => {
                const time = this.clock.elapsedTime;
                
                particles.children.forEach(sprite => {
                    // 回転アニメーション
                    sprite.rotation += sprite.userData.rotationSpeed;
                    
                    // 明滅アニメーション
                    const blinkFactor = 0.5 + Math.sin(time * sprite.userData.blinkSpeed + sprite.userData.blinkTime) * 0.5;
                    sprite.material.opacity = blinkFactor;
                    sprite.scale.x = sprite.scale.y = (0.05 + Math.random() * 0.15) * blinkFactor;
                    
                    // ゆっくり移動
                    const moveAngle = sprite.userData.moveAngle + time * 0.1;
                    sprite.position.x += Math.cos(moveAngle) * sprite.userData.moveSpeed * delta;
                    sprite.position.y += Math.sin(moveAngle) * sprite.userData.moveSpeed * delta;
                    
                    // 範囲外に出たら反対側に
                    if (Math.abs(sprite.position.x) > 8) sprite.position.x *= -0.9;
                    if (Math.abs(sprite.position.y) > 8) sprite.position.y *= -0.9;
                });
            },
            clear: () => {
                this.scene.remove(particles);
                this.scene.remove(ambientLight);
            }
        };
    }

    // 稲妻エフェクトを作成
    createLightningEffect(foregroundMesh, backgroundMesh) {
        this.clearEffect();
        console.log("Lightning effect initialized");
        
        const lightningGroup = new THREE.Group();
        this.particleGroups.push(lightningGroup);
        
        // テクスチャが利用可能ならそれを使用、なければプログラムで生成
        let texture;
        if (this.effects.lightningTexture) {
            texture = this.effects.lightningTexture;
        } else {
            // 稲妻テクスチャを生成
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 稲妻の中心線
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            
            // ジグザグパターン
            const segments = 10;
            for (let i = 1; i <= segments; i++) {
                const y = (i / segments) * canvas.height;
                const x = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
            
            // 光の効果を追加
            ctx.globalCompositeOperation = 'lighten';
            ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
            ctx.shadowBlur = 20;
            ctx.stroke();
            
            // もう一度強い光の中心を描く
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(230, 240, 255, 1.0)';
            ctx.stroke();
            
            texture = new THREE.CanvasTexture(canvas);
        }
        
        // 稲妻の本数
        const boltCount = 6;
        
        // 稲妻ボルトの生成
        for (let i = 0; i < boltCount; i++) {
            const boltMaterial = new THREE.SpriteMaterial({
                map: texture,
                color: new THREE.Color(0.8, 0.9, 1.0),
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                opacity: 0
            });
            
            const bolt = new THREE.Sprite(boltMaterial);
            bolt.scale.set(0.8 + Math.random() * 0.4, 3 + Math.random() * 1.5, 1);
            
            // ランダムな位置（カードの周り）
            const angle = (i / boltCount) * Math.PI * 2;
            bolt.position.set(
                Math.cos(angle) * 3,
                Math.sin(angle) * 3,
                0.5
            );
            
            // 回転
            bolt.rotation = angle + Math.PI / 2;
            
            // アニメーション用データ
            bolt.userData = {
                activationDelay: Math.random() * 3,
                lastActivation: -10,
                activeDuration: 0.2,
                intensity: 0.6 + Math.random() * 0.4
            };
            
            lightningGroup.add(bolt);
        }
        
        this.scene.add(lightningGroup);
        
        // 点光源（稲妻の光）
        const lightningLight = new THREE.PointLight(0x6080ff, 0, 15);
        lightningLight.position.set(0, 0, 3);
        this.scene.add(lightningLight);
        
        this.activeEffect = {
            bolts: lightningGroup,
            light: lightningLight,
            update: (delta) => {
                const time = this.clock.elapsedTime;
                
                let anyActive = false;
                
                lightningGroup.children.forEach(bolt => {
                    const data = bolt.userData;
                    
                    // ランダムに稲妻を発生
                    if (time - data.lastActivation > data.activationDelay) {
                        data.lastActivation = time;
                        data.activationDelay = 0.5 + Math.random() * 2.5; // 次の発生までの遅延
                    }
                    
                    // アクティブな時間を計算
                    const activeTime = time - data.lastActivation;
                    const isActive = activeTime < data.activeDuration;
                    
                    if (isActive) {
                        // 稲妻がアクティブな場合
                        const intensity = Math.sin(activeTime / data.activeDuration * Math.PI) * data.intensity;
                        bolt.material.opacity = intensity;
                        
                        // 稲妻が光る回数が多いほど点滅する
                        if (Math.random() < 0.5) {
                            bolt.material.opacity *= 0.5;
                        }
                        
                        anyActive = true;
                    } else {
                        bolt.material.opacity = 0;
                    }
                });
                
                // アクティブな稲妻があれば光を点灯
                lightningLight.intensity = anyActive ? 2.0 : 0;
            },
            clear: () => {
                this.scene.remove(lightningGroup);
                this.scene.remove(lightningLight);
            }
        };
    }

    // 輝きエフェクトを作成
    createGlowEffect(foregroundMesh, backgroundMesh) {
        this.clearEffect();
        console.log("Glow effect initialized");
        
        // 輝きのオーバーレイメッシュを作成
        const glowGeometry = new THREE.PlaneGeometry(7, 10);
        
        // 光るマテリアル
        const glowMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        
        // カード用のグラデーションテクスチャを生成
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 384;
        const ctx = canvas.getContext('2d');
        
        // 放射状グラデーション
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 10,
            canvas.width / 2, canvas.height / 2, canvas.width / 1.5
        );
        gradient.addColorStop(0, 'rgba(255, 255, 220, 0.7)');
        gradient.addColorStop(0.5, 'rgba(255, 220, 150, 0.3)');
        gradient.addColorStop(1, 'rgba(200, 150, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // テクスチャを作成
        const glowTexture = new THREE.CanvasTexture(canvas);
        glowMaterial.map = glowTexture;
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.z = 0.1; // カードよりやや前に配置
        this.scene.add(glowMesh);
        
        // カードを照らす点光源
        const glowLight = new THREE.PointLight(0xffffaa, 0.8, 15);
        glowLight.position.set(0, 0, 5);
        this.scene.add(glowLight);
        
        // パーティクル効果（カードの周りを漂う光の粒子）
        const particleCount = 50;
        const particlesGroup = new THREE.Group();
        this.particleGroups.push(particlesGroup);
        
        // 光の粒子のテクスチャ
        const particleCanvas = document.createElement('canvas');
        particleCanvas.width = 32;
        particleCanvas.height = 32;
        const pctx = particleCanvas.getContext('2d');
        
        const particleGradient = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        particleGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        particleGradient.addColorStop(0.7, 'rgba(255, 240, 200, 0.5)');
        particleGradient.addColorStop(1, 'rgba(255, 220, 150, 0)');
        
        pctx.fillStyle = particleGradient;
        pctx.fillRect(0, 0, 32, 32);
        
        const particleTexture = new THREE.CanvasTexture(particleCanvas);
        
        // 粒子の作成
        for (let i = 0; i < particleCount; i++) {
            const particleMaterial = new THREE.SpriteMaterial({
                map: particleTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const particle = new THREE.Sprite(particleMaterial);
            
            // ランダムな位置（カードの周り）
            const radius = 3 + Math.random() * 1.5;
            const angle = Math.random() * Math.PI * 2;
            const height = -4 + Math.random() * 8;
            
            particle.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                height
            );
            
            // ランダムなサイズ
            const scale = 0.05 + Math.random() * 0.1;
            particle.scale.set(scale, scale, scale);
            
            // アニメーション用データ
            particle.userData = {
                angle: angle,
                radius: radius,
                vertSpeed: (Math.random() - 0.5) * 0.2,
                rotSpeed: 0.05 + Math.random() * 0.1,
                phaseOffset: Math.random() * Math.PI * 2
            };
            
            particlesGroup.add(particle);
        }
        
        this.scene.add(particlesGroup);
        
        this.activeEffect = {
            glowMesh: glowMesh,
            light: glowLight,
            particles: particlesGroup,
            update: (delta) => {
                const time = this.clock.elapsedTime;
                
                // グローの強度を時間とともに変化
                const intensity = 0.5 + Math.sin(time * 0.5) * 0.2;
                glowMaterial.opacity = intensity * 0.6;
                glowLight.intensity = 0.5 + intensity * 0.3;
                
                // 粒子のアニメーション
                particlesGroup.children.forEach(particle => {
                    const data = particle.userData;
                    
                    // 円周上の移動
                    data.angle += data.rotSpeed * delta;
                    
                    // 半径の変化（呼吸のように）
                    const radiusVariation = Math.sin(time * 0.5 + data.phaseOffset) * 0.2;
                    const currentRadius = data.radius + radiusVariation;
                    
                    particle.position.x = Math.cos(data.angle) * currentRadius;
                    particle.position.y = Math.sin(data.angle) * currentRadius;
                    
                    // 上下の動き
                    particle.position.z += data.vertSpeed * delta;
                    
                    // 画面外に出たら反対側に
                    if (particle.position.z > 4) particle.position.z = -4;
                    if (particle.position.z < -4) particle.position.z = 4;
                    
                    // 明滅効果
                    particle.material.opacity = 0.7 + Math.sin(time * 2 + data.phaseOffset) * 0.3;
                });
            },
            clear: () => {
                this.scene.remove(glowMesh);
                this.scene.remove(glowLight);
                this.scene.remove(particlesGroup);
            }
        };
    }
} 