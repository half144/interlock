# Global provider executables

## Context

The user approved one executable per provider, global on this Mac, edited in Accounts. It accepts a command on PATH or a full path, including compatible wrappers. Claude Code and Codex remain the only v1 providers.

## Decision

Reuse Paseo's persisted `agents.providers.<provider>.command` and existing daemon config RPCs. Saving replaces the executable while preserving existing prefix arguments and other provider settings. The live provider registry already applies this configuration to new tasks. Accounts reads the same current configuration for diagnostics, login and logout; it never silently falls back to the default executable.

## Why

One persisted source avoids a separate preference that could authenticate one CLI and launch another. Commands are spawned directly as argv, so paths with spaces remain one executable. Shell aliases are not executable files.

## Interface references

The user's Accounts screenshot and `packages/app/DESIGN.md` own the graphite surfaces, typography, tokens and card layout. Cursor's [integration settings](https://refero.design/pages/6d082fe5-ee64-4e94-9a48-12dd02827792) informs only the inline input/save arrangement. Refero's bundled form guidance informs labels, keyboard submission, disabled saving and inline errors. Executable names and resolved paths use the existing mono input recipe; colors remain reserved for status.
