/**
 * Node.js用テクスチャ生成スクリプト
 * 
 * このスクリプトはNode.js環境でテクスチャを生成し、ファイルに保存します。
 * 実行方法: node generate_node_textures.js
 * 
 * 必要なパッケージ:
 * - canvas: npm install canvas
 * - fs: Node.js標準
 * - path: Node.js標準
 */

const fs = require('fs');
const path = require('path');

let Canvas;
try {
    Canvas = require('canvas');
} catch (e) {
    console.error('canvasモジュールがインストールされていません。以下のコマンドを実行してください:');
    console.error('npm install canvas');
    process.exit(1);
}

// テクスチャ生成スクリプトをインポート
const textureGenerator = require('./generate_textures');

// 保存先ディレクトリ
const OUTPUT_DIR = path.join(__dirname, 'generated');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// テクスチャの種類
const TEXTURE_TYPES = ['fire', 'sparkle', 'lightning', 'glow'];

/**
 * テクスチャを生成して保存する
 */
function generateAndSaveTextures() {
    console.log('テクスチャの生成を開始します...');
    
    // 各テクスチャタイプに対して処理
    TEXTURE_TYPES.forEach(type => {
        const canvas = Canvas.createCanvas(textureGenerator.TEXTURE_SIZE, textureGenerator.TEXTURE_SIZE);
        
        // テクスチャの生成
        let generatedCanvas;
        switch (type) {
            case 'fire':
                generatedCanvas = textureGenerator.generateFireTexture(canvas);
                break;
            case 'sparkle':
                generatedCanvas = textureGenerator.generateSparkleTexture(canvas);
                break;
            case 'lightning':
                generatedCanvas = textureGenerator.generateLightningTexture(canvas);
                break;
            case 'glow':
                generatedCanvas = textureGenerator.generateGlowTexture(canvas);
                break;
        }
        
        // ファイルに保存
        const outputPath = path.join(OUTPUT_DIR, `${type}_particle.png`);
        const buffer = generatedCanvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`✅ ${type} テクスチャを生成しました: ${outputPath}`);
    });
    
    console.log('全てのテクスチャが生成されました。');
}

// メイン処理の実行
generateAndSaveTextures(); 