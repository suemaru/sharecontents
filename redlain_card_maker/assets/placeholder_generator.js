document.addEventListener('DOMContentLoaded', function() {
    // DOM要素
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageTypeSelect = document.getElementById('image-type');
    const categorySelect = document.getElementById('category');
    const categoryContainer = document.getElementById('category-container');
    const bgColorInput = document.getElementById('bg-color');
    const fgColorInput = document.getElementById('fg-color');
    const accentColorInput = document.getElementById('accent-color');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const canvasContainer = document.getElementById('canvas-container');
    const statusElement = document.getElementById('status');

    // データ定義
    const cardImages = [
        { id: 'explorer', name: '宇宙の探検家', type: 'クルー' },
        { id: 'spaceship', name: '宇宙船エンデバー', type: 'シップ' },
        { id: 'gravity_device', name: '重力制御装置', type: 'テック' },
        { id: 'planet', name: '惑星アルファ', type: 'ロケーション' },
        { id: 'alien', name: '異星生物オメガ', type: 'エイリアン' }
    ];

    const cardBacks = [
        { id: 'card_back_standard', name: '標準' },
        { id: 'card_back_premium', name: 'プレミアム' }
    ];

    const cardFrames = [
        { id: 'frame_crew', name: 'クルー' },
        { id: 'frame_ship', name: 'シップ' },
        { id: 'frame_tech', name: 'テック' },
        { id: 'frame_location', name: 'ロケーション' },
        { id: 'frame_alien', name: 'エイリアン' }
    ];

    // 初期表示設定
    updateCategoryOptions();

    // イベントリスナー設定
    imageTypeSelect.addEventListener('change', updateCategoryOptions);
    generateBtn.addEventListener('click', generatePreview);
    downloadBtn.addEventListener('click', function() {
        downloadImage(canvas);
    });
    downloadAllBtn.addEventListener('click', generateAllImages);
    widthInput.addEventListener('change', updateCanvasSize);
    heightInput.addEventListener('change', updateCanvasSize);

    // カテゴリのセレクトボックスを更新
    function updateCategoryOptions() {
        // 古いオプションをクリア
        categorySelect.innerHTML = '';
        
        let options = [];
        
        switch(imageTypeSelect.value) {
            case 'card':
                options = cardImages;
                categoryContainer.style.display = 'block';
                break;
            case 'back':
                options = cardBacks;
                categoryContainer.style.display = 'block';
                break;
            case 'frame':
                options = cardFrames;
                categoryContainer.style.display = 'block';
                break;
            default:
                categoryContainer.style.display = 'none';
                break;
        }
        
        // 新しいオプションを追加
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.id;
            optElement.textContent = option.name;
            categorySelect.appendChild(optElement);
        });
        
        generatePreview();
    }

    // キャンバスサイズを更新
    function updateCanvasSize() {
        canvas.width = parseInt(widthInput.value) || 400;
        canvas.height = parseInt(heightInput.value) || 560;
        generatePreview();
    }

    // プレビュー生成
    function generatePreview() {
        const width = canvas.width;
        const height = canvas.height;
        const imageType = imageTypeSelect.value;
        const category = categorySelect.value;
        const bgColor = bgColorInput.value;
        const fgColor = fgColorInput.value;
        const accentColor = accentColorInput.value;
        
        // キャンバスをクリア
        ctx.clearRect(0, 0, width, height);
        
        // 背景を描画
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        
        // 画像タイプに基づいて描画する
        switch(imageType) {
            case 'card':
                drawCardImage(category);
                break;
            case 'back':
                drawCardBack(category);
                break;
            case 'frame':
                drawCardFrame(category);
                break;
        }
    }
    
    // カード画像描画
    function drawCardImage(cardId) {
        const card = cardImages.find(c => c.id === cardId);
        if (!card) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const bgColor = bgColorInput.value;
        const fgColor = fgColorInput.value;
        const accentColor = accentColorInput.value;
        
        // デザイン要素を追加
        drawSpaceBackground(width, height, bgColor);
        
        // タイトルと情報
        ctx.fillStyle = fgColor;
        ctx.font = `bold ${Math.floor(width * 0.07)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(card.name, width / 2, height * 0.15);
        
        ctx.font = `${Math.floor(width * 0.05)}px Arial`;
        ctx.fillText(card.type, width / 2, height * 0.22);
        
        // アクセント色の装飾
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 中央の円
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // 文字
        ctx.fillStyle = fgColor;
        ctx.font = `${Math.floor(width * 0.04)}px Arial`;
        ctx.fillText('宇宙カード', width / 2, height * 0.48);
        ctx.fillText('プレースホルダー', width / 2, height * 0.53);
        
        // 説明テキスト
        ctx.font = `${Math.floor(width * 0.035)}px Arial`;
        ctx.fillText('このカードは', width / 2, height * 0.7);
        ctx.fillText('プレースホルダーとして', width / 2, height * 0.75);
        ctx.fillText('生成されました', width / 2, height * 0.8);
    }
    
    // カード裏面描画
    function drawCardBack(backId) {
        const cardBack = cardBacks.find(c => c.id === backId);
        if (!cardBack) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const bgColor = bgColorInput.value;
        const fgColor = fgColorInput.value;
        const accentColor = accentColorInput.value;
        
        // 宇宙背景
        drawSpaceBackground(width, height, bgColor);
        
        // 中央のエンブレム
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width * 0.25;
        
        // 外側の円
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 内側の円
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 星のシンボル
        ctx.fillStyle = fgColor;
        drawStar(centerX, centerY, 5, radius * 0.7, radius * 0.3);
        
        // テキスト
        ctx.fillStyle = fgColor;
        ctx.font = `bold ${Math.floor(width * 0.06)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('スペースシンドローム', width / 2, height * 0.8);
        
        ctx.font = `${Math.floor(width * 0.04)}px Arial`;
        ctx.fillText(`${cardBack.name}カード裏面`, width / 2, height * 0.85);
    }
    
    // カードフレーム描画
    function drawCardFrame(frameId) {
        const frame = cardFrames.find(c => c.id === frameId);
        if (!frame) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const bgColor = bgColorInput.value;
        const fgColor = fgColorInput.value;
        const accentColor = accentColorInput.value;
        
        // 背景を透明に
        ctx.clearRect(0, 0, width, height);
        
        // フレーム外枠
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = width * 0.04;
        roundRect(ctx, width * 0.05, height * 0.05, width * 0.9, height * 0.9, width * 0.03, false, true);
        
        // 内枠
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = width * 0.01;
        roundRect(ctx, width * 0.1, height * 0.1, width * 0.8, height * 0.8, width * 0.02, false, true);
        
        // カードタイプ表示
        ctx.fillStyle = accentColor;
        roundRect(ctx, width * 0.2, height * 0.05, width * 0.6, height * 0.08, width * 0.02, true, false);
        
        ctx.fillStyle = fgColor;
        ctx.font = `bold ${Math.floor(width * 0.05)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(frame.name, width / 2, height * 0.1);
        
        // 下部装飾
        ctx.fillStyle = accentColor;
        roundRect(ctx, width * 0.1, height * 0.7, width * 0.8, height * 0.2, width * 0.02, true, false);
        
        // フレーム識別テキスト
        ctx.fillStyle = fgColor;
        ctx.font = `${Math.floor(width * 0.035)}px Arial`;
        ctx.fillText('フレームプレースホルダー', width / 2, height * 0.8);
    }
    
    // 宇宙的な背景を描画する
    function drawSpaceBackground(width, height, bgColor) {
        // グラデーションの背景
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(1, adjustColor(bgColor, -30));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // ランダムな星を描画
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < width * height * 0.0005; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 2;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 星形を描画する
    function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
    
    // 角丸長方形を描画
    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        if (fill) {
            ctx.fill();
        }
        
        if (stroke) {
            ctx.stroke();
        }
    }
    
    // 色を明るく/暗くする
    function adjustColor(color, amount) {
        const colorObj = hexToRgb(color);
        const r = Math.max(0, Math.min(255, colorObj.r + amount));
        const g = Math.max(0, Math.min(255, colorObj.g + amount));
        const b = Math.max(0, Math.min(255, colorObj.b + amount));
        return rgbToHex(r, g, b);
    }
    
    // hex値をRGBオブジェクトに変換
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    // RGB値をhex文字列に変換
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    // キャンバスから画像をダウンロード
    function downloadImage(canvas, filename) {
        const imageType = imageTypeSelect.value;
        const category = categorySelect.value;
        
        let imageFormat = 'image/jpeg';
        let fileExtension = 'jpg';
        
        // フレームの場合はPNG（透明対応）
        if (imageType === 'frame') {
            imageFormat = 'image/png';
            fileExtension = 'png';
        }
        
        const dataURL = canvas.toDataURL(imageFormat, 0.9);
        const link = document.createElement('a');
        
        if (!filename) {
            if (imageType === 'back') {
                filename = `${category}.${fileExtension}`;
            } else {
                filename = `${category}.${fileExtension}`;
            }
        }
        
        link.download = filename;
        link.href = dataURL;
        link.click();
    }
    
    // すべての画像を生成してダウンロード
    function generateAllImages() {
        statusElement.textContent = '生成中...';
        
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        const width = parseInt(widthInput.value) || 400;
        const height = parseInt(heightInput.value) || 560;
        
        // カードメインイメージ
        Promise.all(cardImages.map(card => {
            return new Promise(resolve => {
                // カード画像を描画
                canvas.width = width;
                canvas.height = height;
                
                imageTypeSelect.value = 'card';
                categorySelect.value = card.id;
                generatePreview();
                
                // 画像をダウンロード
                downloadImage(canvas, `${card.id}.jpg`);
                resolve();
            });
        }))
        .then(() => {
            // カード裏面
            return Promise.all(cardBacks.map(back => {
                return new Promise(resolve => {
                    canvas.width = width;
                    canvas.height = height;
                    
                    imageTypeSelect.value = 'back';
                    categorySelect.value = back.id;
                    generatePreview();
                    
                    downloadImage(canvas, `${back.id}.jpg`);
                    resolve();
                });
            }));
        })
        .then(() => {
            // フレーム
            return Promise.all(cardFrames.map(frame => {
                return new Promise(resolve => {
                    canvas.width = width;
                    canvas.height = height;
                    
                    imageTypeSelect.value = 'frame';
                    categorySelect.value = frame.id;
                    generatePreview();
                    
                    downloadImage(canvas, `${frame.id}.png`);
                    resolve();
                });
            }));
        })
        .then(() => {
            // 元の状態に戻す
            canvas.width = originalWidth;
            canvas.height = originalHeight;
            imageTypeSelect.value = 'card';
            updateCategoryOptions();
            generatePreview();
            
            statusElement.textContent = '生成完了！';
            
            // 2秒後にステータスをクリア
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        });
    }
    
    // 初期プレビュー生成
    generatePreview();
}); 