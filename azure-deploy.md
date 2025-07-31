# Azure App Service デプロイ設定

## 必要な設定

### 1. 環境変数の設定
Azure App Serviceの設定で以下の環境変数を追加してください：

```
NODE_ENV=production
NEXT_PUBLIC_API_ENDPOINT=https://your-backend-url.azurewebsites.net
```

### 2. ビルド設定
Azure App Serviceの設定で以下のビルドコマンドを設定してください：

```
npm run build
```

### 3. 起動コマンド
Azure App Serviceの設定で以下の起動コマンドを設定してください：

```
npm start
```

### 4. Node.js バージョン
Azure App Serviceの設定でNode.js 20.xを選択してください。

## トラブルシューティング

### MODULE_NOT_FOUNDエラーの場合
1. `npm install`が実行されているか確認
2. `node_modules`が正しく生成されているか確認
3. 依存関係が正しくインストールされているか確認

### ポート3000での応答なしの場合
1. アプリケーションが正常に起動しているか確認
2. ログを確認してエラーの詳細を確認
3. 環境変数が正しく設定されているか確認 