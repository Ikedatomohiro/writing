# Dev Container 設定

このディレクトリには、VS Code Dev Container の設定ファイルが含まれています。

## 概要

- **Node.js 20** + **Python 3.13 (uv)** + **Claude Code CLI** を含む開発環境
- ネットワークファイアウォールによるセキュリティ強化
- VS Code 拡張機能の自動インストール

**Note**: Python 3.13 は Debian Bookworm の標準リポジトリには含まれていないため、`uv python install` を使用してインストールしています。

## ファイル構成

- `Dockerfile` - コンテナイメージ定義
- `devcontainer.json` - Dev Container 設定
- `init-firewall.sh` - ファイアウォール初期化スクリプト

## 使い方

1. VS Code で「Reopen in Container」を実行
2. コンテナがビルドされ、自動的に開発環境が構築される

## ネットワークファイアウォール

### 許可されているサービス

コンテナからは以下のサービスのみアクセス可能です：

- GitHub (github.com, api.github.com)
- npm Registry (registry.npmjs.org)
- PyPI (pypi.org, files.pythonhosted.org)
- Anthropic API (api.anthropic.com, statsig.anthropic.com)
- VS Code Marketplace (marketplace.visualstudio.com, vscode.blob.core.windows.net)
- Astral (astral.sh) - uv 用

### NET_ADMIN / NET_RAW ケーパビリティについて

`devcontainer.json` で以下のケーパビリティを付与しています：

```json
"runArgs": [
  "--cap-add=NET_ADMIN",
  "--cap-add=NET_RAW"
]
```

**理由**: iptables によるファイアウォール設定に必要です。

**セキュリティ上の注意**: これらのケーパビリティはネットワーク設定の変更を許可するため、信頼できる環境でのみ使用してください。悪意のあるコードが実行された場合、ネットワークトラフィックの傍受やスプーフィング攻撃に悪用される可能性があります。

### DNS 解決とキャッシュについて

ファイアウォールルールは、コンテナ起動時に DNS 解決した IP アドレスに基づいて設定されます。

**制限事項**:
- CDN を使用するサービス（例: `vscode.blob.core.windows.net`）は、DNS ラウンドロビンにより IP が変わる可能性があります
- コンテナ稼働中に IP が変わった場合、接続できなくなる可能性があります

**トラブルシューティング**:
接続エラーが発生した場合は、コンテナを再起動してファイアウォールルールを再構築してください：

```bash
# VS Code のコマンドパレットから
Dev Containers: Rebuild Container
```

### エラー発生時の動作

ファイアウォール初期化中にエラーが発生した場合、自動的にロールバックが実行され、ファイアウォールは許可状態（ACCEPT）にリセットされます。これにより、初期化失敗時でもコンテナが使用不能になることを防ぎます。

## データの永続化

### コマンド履歴

bash/zsh のコマンド履歴は Docker ボリュームに保存されます：

```
writing-bashhistory-${devcontainerId}
```

### Claude Code 設定

Claude Code の設定は以下のボリュームに保存されます：

```
writing-claude-config-${devcontainerId}
```

**セキュリティ上の注意**:
- このボリュームには API キーなどの機密情報が含まれる可能性があります
- ボリュームはコンテナ間で共有されないよう、`devcontainerId` で分離されています
- 不要になったボリュームは手動で削除してください：

```bash
# 未使用の Docker ボリュームを確認
docker volume ls

# 特定のボリュームを削除
docker volume rm writing-claude-config-<id>

# すべての未使用ボリュームを削除（注意して使用）
docker volume prune
```

## トラブルシューティング

### npm install が失敗する

ファイアウォールが正しく設定されていない可能性があります。コンテナを再ビルドしてください。

### 外部 API に接続できない

許可リストにないドメインへのアクセスはブロックされます。必要に応じて `init-firewall.sh` の許可ドメインリストを更新してください。

### ファイアウォール初期化が失敗する

ログを確認してください：

```bash
# postStartCommand のログを確認
cat /tmp/postStartCommand.log
```

エラーが発生した場合、ファイアウォールは自動的に許可状態にリセットされます。
