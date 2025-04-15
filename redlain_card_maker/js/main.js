/**
 * レッドランカードメーカー - メインスクリプト
 */

// Three.js 関連のグローバル変数
let scene, camera, renderer;
let backgroundMesh, foregroundMesh;
let cardEffects;
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
let isOrientationEnabled = false;

// 2Dキャンバス関連のグローバル変数
let canvas;
let ctx;
let cardData = {};
let cardImage = null;
let isLoading = true;
let isDragging = false;
let currentScale = 1;
let startX, startY;
let offsetX = 0, offsetY = 0;

// カードデータの設定（実際のデータはJSONから読み込む）
const DEFAULT_CARD_DATA = {
    title: "スペースシンドローム",
    description: "宇宙空間での長期滞在によって引き起こされる精神的・身体的症状の総称。",
    type: "現象",
    rarity: "一般",
    recordNumber: "No.001",
    year: "2027年",
    effectText: "このカードがプレイされた場合、プレイヤーは「疲労」トークンを2つ受け取る。",
    flavorText: "「宇宙の静寂は、時に人の心を蝕む...」",
    backgroundImage: "assets/images/background.jpg",
    foregroundImage: "assets/images/foreground.png",
    effectType: "none"
};

// DOMが読み込まれた時の処理
document.addEventListener('DOMContentLoaded', () => {
    // ユーティリティの読み込みを確認
    if (!window.AppUtils) {
        console.error('ユーティリティスクリプトが読み込まれていません');
        return;
    }
    
    // ブラウザの互換性チェック
    if (!AppUtils.checkBrowserCompatibility()) {
        return;
    }
    
    // 初期化処理
    initApp();
});

// アプリケーションの初期化
async function initApp() {
    // UI要素の取得
    canvas = document.getElementById('card-canvas');
    
    // Three.jsの初期化
    initThreeJS();
    
    // カードデータのロード
    await loadCardData();
    
    // 画像のロード
    await loadCardImages();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // デバイスの向きの検出を設定
    setupDeviceOrientation();
    
    // ローディング表示を非表示
    AppUtils.toggleLoading(false);
    isLoading = false;
    
    // カードタイトルを表示（タイプライター効果付き）
    updatePageTitle();
    const titleElement = document.querySelector('#card-title h1');
    AppUtils.typeWriterEffect(titleElement, cardData.title);
    
    // 詳細情報を設定
    updateDetailInfo();
    
    // アニメーションループの開始
    animate();
}

// Three.jsの初期化
function initThreeJS() {
    try {
        // コンテナの取得
        const container = document.getElementById('card-canvas');
        
        // シーンの作成
        scene = new THREE.Scene();
        
        // カメラの作成
        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        camera.position.z = 10;
        
        // レンダラーの作成
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0); // 透明背景
        
        // コンテナにレンダラーのキャンバスを追加
        container.appendChild(renderer.domElement);
        
        // 光源の追加
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 5);
        scene.add(directionalLight);
        
        // エフェクトマネージャーの初期化
        cardEffects = new CardEffects(scene);
        cardEffects.init();
        
        AppUtils.debug('Three.jsシーンを初期化しました');
    } catch (error) {
        AppUtils.showError('Three.jsの初期化に失敗しました');
        console.error('Three.js初期化エラー:', error);
    }
}

// カードレイヤーの作成
function createCardLayers(backgroundTexture, foregroundTexture) {
    // すでに存在する場合は削除
    if (backgroundMesh) scene.remove(backgroundMesh);
    if (foregroundMesh) scene.remove(foregroundMesh);
    
    try {
        // 背景レイヤー
        const backgroundGeometry = new THREE.PlaneGeometry(10, 15);
        const backgroundMaterial = new THREE.MeshStandardMaterial({
            map: backgroundTexture,
            side: THREE.DoubleSide
        });
        backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        backgroundMesh.position.z = 0;
        scene.add(backgroundMesh);
        
        // 前景レイヤー
        const foregroundGeometry = new THREE.PlaneGeometry(8, 12);
        const foregroundMaterial = new THREE.MeshStandardMaterial({
            map: foregroundTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        foregroundMesh = new THREE.Mesh(foregroundGeometry, foregroundMaterial);
        foregroundMesh.position.z = 2;
        scene.add(foregroundMesh);
        
        // エフェクトの設定
        cardEffects.setEffect(cardData.effectType, foregroundMesh, backgroundMesh);
        
        AppUtils.debug('カードレイヤーを作成しました');
    } catch (error) {
        AppUtils.showError('カードレイヤーの作成に失敗しました');
        console.error('カードレイヤー作成エラー:', error);
    }
}

// レスポンシブ対応
function handleResize() {
    const container = document.getElementById('card-canvas');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // カメラのアスペクト比を更新
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // レンダラーのサイズを更新
    renderer.setSize(width, height);
    
    AppUtils.debug('ウィンドウサイズに合わせてリサイズしました');
}

// カードデータの読み込み
async function loadCardData() {
    try {
        // URLからカードIDを取得
        const urlParams = new URLSearchParams(window.location.search);
        const cardId = urlParams.get('card');
        
        // カードIDが指定されている場合はそのJSONを読み込む
        if (cardId) {
            try {
                const response = await fetch(`data/${cardId}.json`);
                if (response.ok) {
                    cardData = await response.json();
                    AppUtils.debug(`カードデータ "${cardId}" を読み込みました`, cardData);
                    return;
                } else {
                    console.error(`カードデータ ${cardId} の読み込みに失敗しました: ${response.status}`);
                }
            } catch (error) {
                console.error(`カードデータ ${cardId} の読み込み中にエラーが発生しました:`, error);
            }
        }
        
        // 利用可能なカードデータからランダムに選択
        const availableCards = ['space-syndrome', 'red-anomaly', 'stellar-dust', 'quantum-fluctuation'];
        const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        
        try {
            const response = await fetch(`data/${randomCard}.json`);
            if (response.ok) {
                cardData = await response.json();
                AppUtils.debug(`ランダムなカードデータ "${randomCard}" を読み込みました`, cardData);
                return;
            }
        } catch (error) {
            console.error('ランダムカードの読み込みに失敗しました:', error);
        }
        
        // すべての読み込みが失敗した場合はデフォルトデータを使用
        cardData = DEFAULT_CARD_DATA;
        AppUtils.debug('デフォルトのカードデータを使用します', cardData);
    } catch (error) {
        AppUtils.showError('カードデータの読み込みに失敗しました');
        console.error('カードデータの読み込みエラー:', error);
        cardData = DEFAULT_CARD_DATA;
    }
}

// カード画像の読み込み
async function loadCardImages() {
    try {
        // 背景画像と前景画像のURLを取得
        const backgroundImageUrl = cardData.backgroundImage || 'assets/images/background.jpg';
        const foregroundImageUrl = cardData.foregroundImage || 'assets/images/foreground.png';
        
        // Three.jsのテクスチャローダー
        const textureLoader = new THREE.TextureLoader();
        
        // Promise化して両方の画像を非同期に読み込む
        const [backgroundTexture, foregroundTexture] = await Promise.all([
            new Promise((resolve, reject) => {
                textureLoader.load(
                    backgroundImageUrl,
                    texture => resolve(texture),
                    undefined,
                    error => reject(error)
                );
            }),
            new Promise((resolve, reject) => {
                textureLoader.load(
                    foregroundImageUrl,
                    texture => resolve(texture),
                    undefined,
                    error => reject(error)
                );
            })
        ]);
        
        // カードレイヤーの作成
        createCardLayers(backgroundTexture, foregroundTexture);
        
        AppUtils.debug('カード画像を読み込みました');
    } catch (error) {
        AppUtils.showError('カード画像の読み込みに失敗しました');
        console.error('画像の読み込みエラー:', error);
        
        // プレースホルダーテクスチャを使用
        try {
            const textureLoader = new THREE.TextureLoader();
            const placeholderTexture = textureLoader.load('assets/images/placeholder.jpg');
            createCardLayers(placeholderTexture, placeholderTexture);
        } catch (e) {
            console.error('プレースホルダー画像の読み込みにも失敗しました', e);
        }
    }
}

// イベントリスナーのセットアップ
function setupEventListeners() {
    // リサイズイベント
    window.addEventListener('resize', handleResize);
    
    // タッチイベント
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // マウスイベント
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // ホイールイベント（ズーム）
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    // 詳細表示ボタン
    document.getElementById('detail-overlay').addEventListener('click', () => {
        AppUtils.toggleDetailOverlay(false);
    });
    
    // カードタップで詳細表示
    canvas.addEventListener('click', showCardDetails);
    
    AppUtils.debug('イベントリスナーを設定しました');
}

// デバイスの向きの検出を設定
function setupDeviceOrientation() {
    if (window.DeviceOrientationEvent) {
        // iOSの場合は許可が必要
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // 画面をタップしたときに許可を求める
            document.body.addEventListener('click', async () => {
                try {
                    if (!isOrientationEnabled) {
                        const permission = await DeviceOrientationEvent.requestPermission();
                        if (permission === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                            isOrientationEnabled = true;
                            AppUtils.debug('デバイスの向き検出が許可されました');
                        }
                    }
                } catch (error) {
                    console.error('デバイスの向き検出の許可エラー:', error);
                }
            }, { once: true });
        } else {
            // Android などの場合は直接イベントリスナーを追加
            window.addEventListener('deviceorientation', handleOrientation);
            isOrientationEnabled = true;
            AppUtils.debug('デバイスの向き検出を設定しました');
        }
    } else {
        AppUtils.debug('このデバイスはデバイスの向き検出をサポートしていません');
    }
}

// デバイスの向きの変化を処理
function handleOrientation(event) {
    // デバイスの向きの値を保存
    deviceOrientation.alpha = event.alpha || 0; // Z軸周りの回転
    deviceOrientation.beta = event.beta || 0;   // X軸周りの回転
    deviceOrientation.gamma = event.gamma || 0; // Y軸周りの回転
}

// カードの詳細情報を表示
function showCardDetails() {
    const detailOverlay = document.getElementById('detail-overlay');
    const detailNumber = document.getElementById('detail-number');
    const detailDescription = document.getElementById('detail-description');
    
    // 詳細内容を設定
    detailNumber.textContent = `出現記録 ${cardData.recordNumber} / ${cardData.year}`;
    detailDescription.textContent = cardData.description;
    
    // オーバーレイを表示
    AppUtils.toggleDetailOverlay(true);
}

// タッチ操作の処理
function handleTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 1) {
        // 単一タッチ（ドラッグ開始）
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
        
        // タッチインジケーターを表示
        AppUtils.createTouchIndicator(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
        // ピンチ操作の開始ポイント
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
        );
        
        // ピンチの初期距離を保存
        canvas.dataset.pinchDistance = distance;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
        // 単一タッチ（ドラッグ中）
        const touch = e.touches[0];
        continueDrag(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
        // ピンチ操作（ズーム）
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const newDistance = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
        );
        
        const initialDistance = parseFloat(canvas.dataset.pinchDistance) || newDistance;
        
        // ズーム倍率を計算
        let zoomFactor = newDistance / initialDistance;
        
        // 前回のスケールからの相対的な変化を適用
        const newScale = currentScale * zoomFactor;
        
        // スケールを制限（0.5〜3.0の範囲）
        if (newScale >= 0.5 && newScale <= 3.0) {
            currentScale = newScale;
            canvas.dataset.pinchDistance = newDistance;
        }
    }
}

function handleTouchEnd(e) {
    if (e.touches.length === 0) {
        // すべてのタッチが終了
        endDrag();
    }
}

// マウス操作の処理
function handleMouseDown(e) {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
}

function handleMouseMove(e) {
    if (isDragging) {
        e.preventDefault();
        continueDrag(e.clientX, e.clientY);
    }
    
    // PCでのマウス移動による視差効果（デバイスの向きの代替）
    if (!isOrientationEnabled) {
        const container = document.getElementById('card-canvas');
        const rect = container.getBoundingClientRect();
        
        // マウス位置を正規化（-1から1の範囲）
        const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normalizedY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        // マウスの感度を調整（より大きな動きを得るために値を増加）
        const mouseSensitivity = 15; // 20から15に調整
        
        // 向きの値を設定（マウス位置に基づく）
        deviceOrientation.gamma = normalizedX * mouseSensitivity; 
        deviceOrientation.beta = normalizedY * mouseSensitivity;
    }
}

function handleMouseUp() {
    endDrag();
}

// ドラッグ操作の共通処理
function startDrag(clientX, clientY) {
    isDragging = true;
    startX = clientX;
    startY = clientY;
}

function continueDrag(clientX, clientY) {
    if (isDragging) {
        const dx = (clientX - startX) / currentScale;
        const dy = (clientY - startY) / currentScale;
        
        offsetX += dx;
        offsetY += dy;
        
        // 移動量を制限
        const maxOffset = 5;
        offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
        offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));
        
        startX = clientX;
        startY = clientY;
    }
}

function endDrag() {
    isDragging = false;
}

// ホイールでのズーム処理
function handleWheel(e) {
    e.preventDefault();
    
    const wheelDelta = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = currentScale * wheelDelta;
    
    // スケールを制限（0.5〜3.0の範囲）
    if (newScale >= 0.5 && newScale <= 3.0) {
        currentScale = newScale;
    }
}

// デバイスの向きに基づいて視差効果を適用
function applyParallaxEffect() {
    if (!backgroundMesh || !foregroundMesh) return;
    
    // ベータ（X軸周り）とガンマ（Y軸周り）の値を使用
    const beta = deviceOrientation.beta;
    const gamma = deviceOrientation.gamma;
    
    // 値を制限して滑らかに動かす
    const maxTilt = 12; // 最大傾き角度を12に調整（元は15）
    const sensitivity = 0.8; // 感度係数を追加
    
    // 傾きの値を制限
    const limitedBeta = Math.max(-maxTilt, Math.min(maxTilt, beta * sensitivity));
    const limitedGamma = Math.max(-maxTilt, Math.min(maxTilt, gamma * sensitivity));
    
    // 背景は少しだけ動かす（遠くにあるため）
    backgroundMesh.rotation.x = THREE.MathUtils.lerp(
        backgroundMesh.rotation.x,
        THREE.MathUtils.degToRad(limitedBeta * 0.2), // 0.3から0.2に減少
        0.05
    );
    backgroundMesh.rotation.y = THREE.MathUtils.lerp(
        backgroundMesh.rotation.y,
        THREE.MathUtils.degToRad(limitedGamma * 0.2), // 0.3から0.2に減少
        0.05
    );
    
    // 前景はより大きく動かす（近くにあるため）
    foregroundMesh.rotation.x = THREE.MathUtils.lerp(
        foregroundMesh.rotation.x,
        THREE.MathUtils.degToRad(limitedBeta * 0.5), // 0.6から0.5に調整
        0.08 // 0.05から0.08に増加して少し早く応答
    );
    foregroundMesh.rotation.y = THREE.MathUtils.lerp(
        foregroundMesh.rotation.y,
        THREE.MathUtils.degToRad(limitedGamma * 0.5), // 0.6から0.5に調整
        0.08 // 0.05から0.08に増加して少し早く応答
    );
    
    // 前景に軽い位置移動も追加して視差効果を強化
    foregroundMesh.position.x = THREE.MathUtils.lerp(
        foregroundMesh.position.x,
        limitedGamma * 0.03, // 0.02から0.03に増加
        0.1
    );
    foregroundMesh.position.y = THREE.MathUtils.lerp(
        foregroundMesh.position.y,
        -limitedBeta * 0.03, // 0.02から0.03に増加
        0.1
    );
    
    // 手動での操作中は視差効果をオフにする
    if (isDragging) {
        // 手動操作用のカメラ位置調整
        camera.position.x = offsetX;
        camera.position.y = offsetY;
    }
}

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    
    // 視差効果を適用
    applyParallaxEffect();
    
    // エフェクトを更新
    if (cardEffects) {
        cardEffects.update();
    }
    
    // シーンをレンダリング
    renderer.render(scene, camera);
}

// ページタイトルを更新
function updatePageTitle() {
    document.title = `${cardData.title} | レッドランカードメーカー`;
}

// 詳細情報を更新
function updateDetailInfo() {
    const detailNumber = document.getElementById('detail-number');
    const detailDescription = document.getElementById('detail-description');
    
    if (detailNumber) {
        detailNumber.textContent = `${cardData.recordNumber} / ${cardData.year}`;
    }
    
    if (detailDescription) {
        detailDescription.textContent = cardData.description;
    }
} 