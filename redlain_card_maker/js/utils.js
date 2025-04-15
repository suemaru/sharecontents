/**
 * レッドランカードメーカー - ユーティリティ関数
 */

// ブラウザ互換性チェック
function checkBrowserCompatibility() {
    if (!window.WebGLRenderingContext) {
        showError('このブラウザはWebGLに対応していません。最新のブラウザをご使用ください。');
        return false;
    }
    
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            throw new Error('WebGLがサポートされていません');
        }
    } catch (e) {
        showError('WebGLの初期化に失敗しました。他のブラウザをお試しください。');
        return false;
    }
    
    return true;
}

// エラーメッセージを表示
function showError(message) {
    const loading = document.getElementById('loading');
    if (loading) {
        const loadingMessage = loading.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.innerHTML = `<span style="color:#ff3333">${message}</span>`;
            const spinner = loading.querySelector('.spinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
        }
    }
}

// 要素の表示/非表示を切り替え
function toggleElementVisibility(element, isVisible) {
    if (element) {
        if (isVisible) {
            element.classList.add('visible');
            element.classList.remove('hidden');
        } else {
            element.classList.remove('visible');
            element.classList.add('hidden');
        }
    }
}

// 詳細情報オーバーレイの表示/非表示を切り替え
function toggleDetailOverlay(show) {
    const overlay = document.getElementById('detail-overlay');
    toggleElementVisibility(overlay, show);
}

// ローディング表示の切り替え
function toggleLoading(show) {
    const loading = document.getElementById('loading');
    if (!show) {
        loading.classList.add('hidden');
        // しばらくしてから完全に非表示にする
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    } else {
        loading.style.display = 'flex';
        loading.classList.remove('hidden');
    }
}

// タッチインジケーターを作成（指紋のような痕跡）
function createTouchIndicator(x, y) {
    const indicator = document.createElement('div');
    indicator.className = 'touch-indicator';
    indicator.style.left = `${x}px`;
    indicator.style.top = `${y}px`;
    document.body.appendChild(indicator);
    
    // アニメーション終了後に要素を削除
    setTimeout(() => {
        indicator.remove();
    }, 1000);
}

// ランダムな数値を特定の範囲で生成
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// 指定された確率で真偽を返す
function randomChance(probability) {
    return Math.random() < probability;
}

// テキストをタイプライター風に表示
function typeWriterEffect(element, text, speed = 30) {
    let i = 0;
    element.textContent = '';
    
    function typeChar() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, speed);
        }
    }
    
    typeChar();
}

// デバイスがモバイルかどうかを検出
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// デバッグ用ログ出力（開発モードのみ）
const DEBUG_MODE = false;
function debug(...args) {
    if (DEBUG_MODE) {
        console.log('[DEBUG]', ...args);
    }
}

// 画像ファイルをロード
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`画像の読み込みに失敗しました: ${src}`));
        img.src = src;
    });
}

// 配列からランダムに要素を選択
function getRandomArrayElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// エクスポート
window.AppUtils = {
    checkBrowserCompatibility,
    showError,
    toggleElementVisibility,
    toggleDetailOverlay,
    toggleLoading,
    createTouchIndicator,
    getRandomInRange,
    randomChance,
    typeWriterEffect,
    isMobileDevice,
    debug,
    loadImage,
    getRandomArrayElement,
    isIOS,
    isMobile,
    hasOrientationSupport,
    requestDeviceOrientationPermission,
    mapRange,
    clamp
};

// デバイスがiOSかどうかを判定
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// デバイスがモバイルかどうかを判定 (isMobileDeviceと統合)
function isMobile() {
    return isMobileDevice();
}

// デバイスの向きが変わった時のイベントをサポートしているかを判定
function hasOrientationSupport() {
    return 'DeviceOrientationEvent' in window;
}

// DeviceOrientationEventを使用するための許可を要求（iOS 13以降）
async function requestDeviceOrientationPermission() {
    if (!isIOS() || !hasOrientationSupport()) {
        return true; // iOSではない、またはDeviceOrientationEventがサポートされていない場合はtrueを返す
    }

    // iOS 13以降の場合
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('デバイスの向きの許可を取得できませんでした:', error);
            return false;
        }
    }

    return true; // iOS 13未満の場合は許可不要
}

// 角度を-1から1の範囲にマッピング
function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// 値を指定範囲内に制限する
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// テクスチャのロードプロミスを作成
function loadTexture(url) {
    return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            url,
            texture => resolve(texture),
            undefined,
            error => reject(error)
        );
    });
}

// JSON設定ファイルを読み込む
async function loadCardData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('カードデータの読み込みに失敗しました:', error);
        // デフォルトのカードデータを返す
        return {
            title: "サンプルカード",
            recordNumber: "No.000",
            year: "20XX年",
            description: "カードデータの読み込みに失敗しました。",
            backgroundImage: "assets/images/default_bg.jpg",
            foregroundImage: "assets/images/default_fg.png",
            effectType: "none"
        };
    }
} 