# レッドランカードメーカー

スペースシンドロームプロジェクトのデジタルカードビジュアライザーです。カードの3Dビューと特殊効果を実装しています。

## 機能

- Three.jsを使用した3Dカードビジュアライゼーション
- デバイスの傾きを利用した視差効果（iOS、Android対応）
- モバイルとPC両方でのインタラクション
- 4種類のビジュアルエフェクト:
  - 火炎 (Fire)
  - キラキラ (Sparkle)
  - 稲妻 (Lightning)
  - 光 (Glow)
- タッチ/クリックによる詳細情報表示
- レスポンシブデザイン

## 使い方

### デモの起動

1. `demo.html`にアクセスして、サンプルカードのコレクションを表示します
2. カードをタップ/クリックして、詳細ビューを開きます

### カードデータの追加

1. `data/`ディレクトリにJSON形式で新しいカードデータを追加します
2. 以下の形式に従ってください:

```json
{
  "title": "カードタイトル",
  "description": "カードの説明",
  "type": "カードタイプ",
  "rarity": "レアリティ",
  "recordNumber": "No.XXX",
  "year": "20XX年",
  "effectText": "ゲーム内テキスト",
  "flavorText": "フレーバーテキスト",
  "backgroundImage": "assets/images/background.jpg",
  "foregroundImage": "assets/images/foreground.png",
  "effectType": "fire/sparkle/lightning/glow/none"
}
```

3. `index.html?card=あなたのカードID`のURLで直接アクセス可能になります

### テクスチャの生成

1. `assets/texture_generator.html`にアクセスして、新しいエフェクトテクスチャを生成します
2. テクスチャタイプを選択し、「テクスチャをダウンロード」ボタンをクリックします
3. ダウンロードしたテクスチャファイルを`assets/textures/`ディレクトリに配置します

## 技術要件

- WebGL対応ブラウザ
- モバイルデバイスでの最適なエクスペリエンスには:
  - iOS: Safari 13以上
  - Android: Chrome最新版
- デバイスの向き検出を利用するためには許可が必要です（iOSの場合）

## 開発者向け情報

### プロジェクト構造

```
redlain_card_maker/
├── index.html        # メインカードビューアー
├── demo.html         # デモページ
├── assets/           # 画像とテクスチャ
│   ├── images/       # カード画像
│   └── textures/     # エフェクト用テクスチャ
├── css/              # スタイルシート
│   └── style.css     # メインスタイル
├── data/             # カードデータJSONファイル
├── js/               # JavaScriptファイル
│   ├── main.js       # メインロジック
│   ├── effects.js    # エフェクト管理
│   └── utils.js      # ユーティリティ関数
└── readme.md         # このファイル
```

### パフォーマンス最適化

- モバイルデバイスでパフォーマンスが低下する場合:
  - `effects.js`のパーティクル数を調整します
  - テクスチャサイズを小さくします
  - 低スペックモード用のフラグを追加します（`const LOW_SPEC_MODE = true;`）

## ライセンス

このプロジェクトはスペースシンドロームプロジェクトの一部として開発されています。