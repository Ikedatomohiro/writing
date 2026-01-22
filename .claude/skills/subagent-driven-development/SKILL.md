---
name: subagent-driven-development
description: 実装計画を独立したタスク単位でサブエージェントに分配し、2段階レビュー（仕様準拠→コード品質）で品質を確保するワークフロー。
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## When to Use

**vs. Manual execution:**
- Subagents follow TDD naturally
- Fresh context per task (no confusion)
- Parallel-safe (subagents don't interfere)
- Subagent can ask questions (before AND during work)

**Use when:**
- Have implementation plan with independent tasks
- Tasks mostly independent (not tightly coupled)
- Want to stay in this session (no context switch)

## The Process

```
Read plan, extract all tasks with full text, note context, create TodoWrite
    |
    v
[Per Task Loop]
    |
    +-> Dispatch implementer subagent (./implementer-prompt.md)
    |       |
    |       v
    |   Implementer asks questions? --yes--> Answer questions, provide context
    |       |                                     |
    |       no                                    |
    |       |<------------------------------------+
    |       v
    |   Implementer implements, tests, commits, self-reviews
    |       |
    |       v
    +-> Dispatch spec reviewer subagent (./spec-reviewer-prompt.md)
    |       |
    |       v
    |   Spec reviewer confirms code matches spec?
    |       |
    |       no --> Implementer fixes spec gaps --> [re-review]
    |       |
    |       yes
    |       v
    +-> Dispatch code quality reviewer subagent (./code-quality-reviewer-prompt.md)
    |       |
    |       v
    |   Code quality reviewer approves?
    |       |
    |       no --> Implementer fixes quality issues --> [re-review]
    |       |
    |       yes
    |       v
    +-> Mark task complete in TodoWrite
    |       |
    |       v
    +-- More tasks remain? --yes--> [back to Per Task Loop]
            |
            no
            v
    Dispatch final pr-review for entire implementation
            |
            v
    Use finishing-a-development-branch skill
```

## Prompt Templates

- `./implementer-prompt.md` - Dispatch implementer subagent
- `./spec-reviewer-prompt.md` - Dispatch spec compliance reviewer subagent
- `./code-quality-reviewer-prompt.md` - Dispatch code quality reviewer subagent

## Example Workflow

```
You: I'm using Subagent-Driven Development to execute this plan.

[Read plan file once: docs/plans/feature-plan.md]
[Extract all 5 tasks with full text and context]
[Create TodoWrite with all tasks]

Task 1: Hook installation script

[Get Task 1 text and context (already extracted)]
[Dispatch implementation subagent with full task text + context]

Implementer: "Before I begin - should the hook be installed at user or system level?"

You: "User level (~/.config/superpowers/hooks/)"

Implementer: "Got it. Implementing now..."
[Later] Implementer:
  - Implemented install-hook command
  - Added tests, 5/5 passing
  - Self-review: Found I missed --force flag, added it
  - Committed

[Dispatch spec compliance reviewer]
Spec reviewer: OK Spec compliant - all requirements met, nothing extra

[Get git SHAs, dispatch code quality reviewer]
Code reviewer: Strengths: Good test coverage, clean. Issues: None. Approved.

[Mark Task 1 complete]

Task 2: Recovery modes
...

[After all tasks]
[Dispatch final pr-review]
Final reviewer: All requirements met, ready to merge

Done!
```

## Advantages

**Efficiency gains:**
- No file reading overhead (controller provides full text)
- Controller curates exactly what context is needed
- Subagent gets complete information upfront
- Questions surfaced before work begins (not after)

**Quality gates:**
- Self-review catches issues before handoff
- Two-stage review: spec compliance, then code quality
- Review loops ensure fixes actually work
- Spec compliance prevents over/under-building
- Code quality ensures implementation is well-built

**Cost:**
- More subagent invocations (implementer + 2 reviewers per task)
- Controller does more prep work (extracting all tasks upfront)
- Review loops add iterations
- But catches issues early (cheaper than debugging later)

## Red Flags

**Never:**
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context (subagent needs to understand where task fits)
- Ignore subagent questions (answer before letting them proceed)
- Accept "close enough" on spec compliance (spec reviewer found issues = not done)
- Skip review loops (reviewer found issues = implementer fixes = review again)
- Let implementer self-review replace actual review (both are needed)
- **Start code quality review before spec compliance is OK** (wrong order)
- Move to next task while either review has open issues

**If subagent asks questions:**
- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

**If reviewer finds issues:**
- Implementer (same subagent) fixes them
- Reviewer reviews again
- Repeat until approved
- Don't skip the re-review

**If subagent fails task:**
- Dispatch fix subagent with specific instructions
- Don't try to fix manually (context pollution)

## Integration

**Required workflow skills:**
- **writing-plans** - Creates the plan this skill executes
- **pr-review** - Code review template for reviewer subagents
- **finishing-a-development-branch** - Complete development after all tasks

**Subagents should use:**
- TDD principles for each task
