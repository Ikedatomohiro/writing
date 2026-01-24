# Writer Agent タスクリスト

## タスク一覧

### Phase 1: スキーマ定義

- [ ] **T1.1**: `schemas/input.py` - WriterInput定義
  - 完了条件: バリデーションテストがパス

- [ ] **T1.2**: `schemas/output.py` - 出力スキーマ定義
  - Section, ArticlePlan, ReflectionResult, WriterOutput
  - 完了条件: バリデーションテストがパス

- [ ] **T1.3**: `schemas/state.py` - AgentState定義
  - 完了条件: TypedDictが正しく定義される

- [ ] **T1.4**: `schemas/__init__.py` - エクスポート設定
  - 完了条件: importが動作する

### Phase 2: プロンプト定義

- [ ] **T2.1**: `prompts/planner.py` - 計画プロンプト
  - 完了条件: PromptConfigが作成される

- [ ] **T2.2**: `prompts/executor.py` - 執筆プロンプト
  - 完了条件: PromptConfigが作成される

- [ ] **T2.3**: `prompts/reflector.py` - 内省プロンプト
  - 完了条件: PromptConfigが作成される

- [ ] **T2.4**: `prompts/integrator.py` - 統合プロンプト
  - 完了条件: PromptConfigが作成される

- [ ] **T2.5**: `prompts/__init__.py` - エクスポート設定
  - 完了条件: importが動作する

### Phase 3: ノード実装

- [ ] **T3.1**: PlannerNode実装
  - BaseNode継承
  - 完了条件: ユニットテストがパス

- [ ] **T3.2**: ExecutorNode実装
  - 各セクションを順次執筆
  - 完了条件: ユニットテストがパス

- [ ] **T3.3**: ReflectorNode実装
  - BaseNode継承
  - 完了条件: ユニットテストがパス

- [ ] **T3.4**: IntegratorNode実装
  - BaseNode継承
  - 完了条件: ユニットテストがパス

### Phase 4: エージェント実装

- [ ] **T4.1**: WriterAgent実装
  - BaseAgent継承
  - 完了条件: グラフ構築テストがパス

- [ ] **T4.2**: 後方互換関数実装
  - create_writer_graph(), run_writer()
  - 完了条件: 統合テストがパス

### Phase 5: エクスポートと統合

- [ ] **T5.1**: `__init__.py` 更新
  - 公開APIをエクスポート
  - 完了条件: importが動作する

- [ ] **T5.2**: 全テスト実行
  - 既存187件 + 新規テストがパス
  - 完了条件: `uv run pytest` が全パス

## 依存関係

```
T1.1 → T1.4
T1.2 → T1.4
T1.3 → T1.4
T1.4 → T3.1, T3.2, T3.3, T3.4

T2.1 → T2.5
T2.2 → T2.5
T2.3 → T2.5
T2.4 → T2.5
T2.5 → T3.1, T3.2, T3.3, T3.4

T3.1, T3.2, T3.3, T3.4 → T4.1
T4.1 → T4.2
T4.2 → T5.1
T5.1 → T5.2
```

## 優先順位

1. Phase 1（スキーマ）- 他すべての基盤
2. Phase 2（プロンプト）- ノード実装の前提
3. Phase 3（ノード）- エージェントの構成要素
4. Phase 4（エージェント）- 最終的な動作確認
5. Phase 5（統合）- 公開とテスト
