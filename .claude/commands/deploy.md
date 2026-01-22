Vercelにデプロイを実行してください。

## デプロイ対象

デフォルトでは **mainブランチ** を対象にデプロイします。

`gh workflow run` の `-r` オプションでブランチやタグを指定できます:
- `-r` 省略: mainブランチ
- `-r ブランチ名`: 指定したブランチをデプロイ
- `-r タグ名`: 指定したタグをデプロイ

## デプロイ環境

引数で環境を指定できます:
- `preview` (デフォルト): プレビュー環境にデプロイ
- `production`: 本番環境にデプロイ

## 実行手順

### 1. デプロイ前の確認

デプロイ前に以下を確認してください:

- [ ] デプロイ対象のブランチ/タグがリモートにプッシュされていること
- [ ] ビルドが成功すること (`npm run build`)
- [ ] テストが全てパスすること (`npm test`)
- [ ] 未コミットの変更がないこと (`git status`)

### 2. デプロイ実行

GitHub Actionsのワークフローを手動でトリガーします:

```bash
# プレビューデプロイ（mainブランチ）
gh workflow run deploy.yml -f environment=preview

# 本番デプロイ（mainブランチ）
gh workflow run deploy.yml -f environment=production

# 特定のブランチをデプロイ
gh workflow run deploy.yml -r feature/my-branch -f environment=preview

# 特定のタグをデプロイ
gh workflow run deploy.yml -r v1.0.0 -f environment=production
```

### 3. デプロイ状況の確認

ワークフローの実行状況を確認:

```bash
# 最新のワークフロー実行を確認
gh run list --workflow=deploy.yml --limit=1

# 実行中のワークフローを監視
gh run watch
```

### 4. デプロイ完了の報告

デプロイが完了したら、以下を報告:
- デプロイ環境 (preview / production)
- ワークフローの実行結果
- デプロイURL（Vercelから取得できる場合）

## 注意事項

- 本番デプロイ (`production`) は慎重に実行してください
- デプロイに必要なシークレット (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) がGitHub Secretsに設定されている必要があります
