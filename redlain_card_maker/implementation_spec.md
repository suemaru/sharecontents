# レッドランカードメーカー実装仕様書

## 目的

「スペースシンドローム」プロジェクトにおける、スマホ傾き対応・視差効果付きのデジタルカードプロトタイプを実装する。このプロトタイプは、主にタイプBとCのゲーム内で使用される戦闘用・収集用・取引用カードの視覚的表現を確認するためのものです。

## 技術要件

- **フレームワーク**: Three.js + vanilla JS/HTML/CSS
- **デバイスセンサー**: DeviceOrientationEvent APIを使用
- **対応ブラウザ**: iOS Safari、Android Chrome
- **レスポンシブ対応**: スマートフォン優先、PC表示も考慮
- **ホスティング**: GitHub PagesまたはNetlifyでの公開を前提

## ファイル構成

```
redlain_card_maker/
├── index.html        # メインHTMLファイル
├── css/
│   └── style.css     # スタイル定義
├── js/
│   ├── main.js       # メインロジック
│   ├── effects.js    # エフェクト処理
│   └── utils.js      # ユーティリティ関数
├── assets/
│   ├── images/       # 背景・前景画像
│   └── textures/     # エフェクト用テクスチャ
└── data/
    └── card.json     # カード設定データ
```

## カード構造

### 視覚レイヤー

1. **背景レイヤー** (PlaneGeometry)
   - z-index: 0
   - 素材: 実在地域の写真（JPG形式）
   - 表示サイズ: 画面いっぱいに表示

2. **前景レイヤー** (PlaneGeometry)
   - z-index: 10
   - 素材: 生成AIで作成したレッドラン（透過PNG形式）
   - 表示サイズ: 背景より小さく、中央に配置

3. **エフェクトレイヤー** (Points/Particles/Shader)
   - z-index: 5（背景と前景の間）
   - 5種類のエフェクトから選択（fire, sparkle, lightning, glow, none）

### テキスト情報

1. **タイトル**
   - 常時表示、画面上部中央
   - フォント: sans-serif系の読みやすいもの
   - カラー: 白 (#FFFFFF)、シャドウあり

2. **詳細情報**（タップ時のみ表示）
   - 記録番号・年号: 画面下部中央
   - 解説文: 画面中央
   - 表示時は背景を半透明グレーにオーバーレイ

## 視差効果の実装

1. **カメラ設定**
   ```javascript
   const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.position.z = 30;
   ```

2. **デバイス傾き検出**
   ```javascript
   window.addEventListener('deviceorientation', (event) => {
     // スマホの傾き（beta: 前後傾き、gamma: 左右傾き）を取得
     const tiltX = event.gamma ? event.gamma * 0.2 : 0; // 係数で感度調整
     const tiltY = event.beta ? event.beta * 0.2 : 0;
     
     // 傾きに応じてカメラまたはレイヤーを移動
     updateLayerPositions(tiltX, tiltY);
   });
   ```

3. **視差アニメーション**
   ```javascript
   function updateLayerPositions(tiltX, tiltY) {
     // 前景と背景で移動量に差をつけて視差を表現
     backgroundLayer.position.x = tiltX * 0.5;
     backgroundLayer.position.y = -tiltY * 0.5;
     
     foregroundLayer.position.x = tiltX * 2.0;
     foregroundLayer.position.y = -tiltY * 2.0;
   }
   ```

## エフェクト実装仕様

各エフェクトは `effects.js` に実装し、カードデータの `effectType` に応じて適用。

1. **炎（fire）**
   - 画面下部からの赤〜オレンジの揺らめく光
   - 上昇する火の粉パーティクル（Points）
   - 不規則な明滅

2. **キラキラ（sparkle）**
   - 中央から放射状に広がる光の粒子
   - サイズ・色・透明度のランダム変化

3. **雷（lightning）**
   - ランダムな間隔で一瞬の閃光
   - 背景と前景の間にジグザグの線形パス

4. **光（glow）**
   - 画面上部からのスポットライト効果
   - 前景のみを明るく照らすマスク処理

5. **なし（none）**
   - エフェクトなし

## UI操作

1. **カードタップ処理**
   ```javascript
   document.addEventListener('click', toggleDetailInfo);
   
   function toggleDetailInfo() {
     const detailOverlay = document.getElementById('detail-overlay');
     detailOverlay.classList.toggle('visible');
   }
   ```

## データ構造

```json
{
  "title": "岸和田城上空の龍",
  "recordNumber": "No.014",
  "year": "2027年",
  "description": "このレッドランは、かつて岸和田の地に現れた最初のイデア体である。",
  "backgroundImage": "bg_kishiwada.jpg",
  "foregroundImage": "fg_dragon.png",
  "effectType": "lightning"
}
```

## 性能最適化

1. テクスチャ圧縮と適切なサイズ設定
2. エフェクト粒子数の最適化（モバイル向けに調整）
3. アニメーションフレームの制限（必要に応じてフレームレート調整）
4. アセットの事前読み込み

## 実装上の注意点

1. iOS Safariでは `DeviceOrientationEvent` の使用にユーザーの許可が必要
2. 様々な画面サイズに対応するレスポンシブデザイン
3. 傾き検出がない環境（PC等）では代替UIでの操作を提供

## 拡張性のための設計ポイント

1. カードデータを外部JSONから読み込む方式
2. エフェクトをプラグイン形式で追加可能に
3. レイヤー構造を柔軟に設定できるインターフェース 