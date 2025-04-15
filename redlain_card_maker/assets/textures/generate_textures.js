/**
 * レッドランカードメーカー - テクスチャ生成スクリプト
 * 
 * このスクリプトは、エフェクト用のテクスチャを生成します。
 * Node.jsの環境で実行する場合は、Canvas APIとファイル保存のための
 * モジュールをインストールする必要があります。
 * 
 * ブラウザ環境では、tools/redlain_card_maker/assets/texture_generator.html を使用してください。
 */

// テクスチャサイズ
const TEXTURE_SIZE = 128;

/**
 * 炎パーティクルのテクスチャを生成
 */
function generateFireTexture(canvas) {
    const ctx = canvas.getContext('2d');
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 放射状グラデーションを作成
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width/2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 180, 100, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 100, 50, 0.4)');
    gradient.addColorStop(1, 'rgba(180, 50, 10, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // テクスチャをより炎らしく見せるための加工
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // ランダムなノイズを追加
        if (data[i+3] > 0) {
            const noise = Math.random() * 0.2 + 0.8;
            data[i] = Math.min(255, data[i] * noise);
            data[i+1] = Math.min(255, data[i+1] * noise);
            data[i+2] = Math.min(255, data[i+2] * noise);
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * キラキラパーティクルのテクスチャを生成
 */
function generateSparkleTexture(canvas) {
    const ctx = canvas.getContext('2d');
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 星形を描画
    ctx.fillStyle = 'white';
    ctx.beginPath();
    
    const spikes = 5;
    const outerRadius = canvas.width / 2 - 10;
    const innerRadius = outerRadius / 2.5;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // グロー効果を追加
    ctx.globalCompositeOperation = 'lighten';
    
    const gradient = ctx.createRadialGradient(
        centerX, centerY, innerRadius,
        centerX, centerY, outerRadius * 1.2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(150, 180, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 十字型の光線を追加
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    return canvas;
}

/**
 * 雷パーティクルのテクスチャを生成
 */
function generateLightningTexture(canvas) {
    const ctx = canvas.getContext('2d');
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 雷のジグザグパターンを描画
    ctx.strokeStyle = 'rgba(220, 240, 255, 1)';
    ctx.lineWidth = canvas.width / 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // メインの雷の道筋
    ctx.beginPath();
    
    // 上から下への雷の道筋
    let x = canvas.width / 2;
    let y = 0;
    
    ctx.moveTo(x, y);
    
    const segments = 6;
    const segmentHeight = canvas.height / segments;
    
    for (let i = 1; i <= segments; i++) {
        // 次のポイントのY座標
        y = i * segmentHeight;
        
        // ジグザグのX座標（中心から左右にランダムにずらす）
        x = canvas.width / 2 + (Math.random() - 0.5) * (canvas.width * 0.6);
        
        ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    
    // グロー効果を追加
    ctx.shadowColor = 'rgba(100, 180, 255, 0.8)';
    ctx.shadowBlur = canvas.width / 8;
    ctx.stroke();
    
    // 中心の明るい部分
    ctx.strokeStyle = 'rgba(240, 250, 255, 1)';
    ctx.lineWidth = canvas.width / 40;
    ctx.stroke();
    
    return canvas;
}

/**
 * 光パーティクルのテクスチャを生成
 */
function generateGlowTexture(canvas) {
    const ctx = canvas.getContext('2d');
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 放射状グラデーションを描画
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width/2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 220, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 220, 150, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // 中心に明るいスポットを追加
    const innerGradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width/6
    );
    innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.globalCompositeOperation = 'lighten';
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, canvas.width/4, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}

// ブラウザ環境で実行された場合の処理
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const canvas = document.createElement('canvas');
        canvas.width = TEXTURE_SIZE;
        canvas.height = TEXTURE_SIZE;
        
        const downloadButton = document.getElementById('download');
        const typeSelect = document.getElementById('texture-type');
        const preview = document.getElementById('preview');
        
        // テクスチャタイプが変更されたときの処理
        function updateTexture() {
            const type = typeSelect.value;
            
            // 選択されたタイプに応じてテクスチャを生成
            switch (type) {
                case 'fire':
                    generateFireTexture(canvas);
                    break;
                case 'sparkle':
                    generateSparkleTexture(canvas);
                    break;
                case 'lightning':
                    generateLightningTexture(canvas);
                    break;
                case 'glow':
                    generateGlowTexture(canvas);
                    break;
            }
            
            // プレビューを更新
            preview.src = canvas.toDataURL('image/png');
        }
        
        // ダウンロード処理
        function downloadTexture() {
            const type = typeSelect.value;
            const link = document.createElement('a');
            link.download = `${type}_particle.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        // イベントリスナーを設定
        typeSelect.addEventListener('change', updateTexture);
        downloadButton.addEventListener('click', downloadTexture);
        
        // 初期表示
        updateTexture();
    });
}

// Node.js環境で実行された場合のエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TEXTURE_SIZE,
        generateFireTexture,
        generateSparkleTexture,
        generateLightningTexture,
        generateGlowTexture
    };
} 