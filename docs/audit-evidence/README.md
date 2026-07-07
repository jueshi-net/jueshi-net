# Audit Evidence

This directory contains raw, command-generated evidence for the V4 public UI audit.

Files:
- app-file-list.txt
- public-page-file-list.txt
- component-file-list.txt
- header-footer-shell-grep.txt
- nav-grep.txt
- resources-grep.txt
- workspace-file-list.txt
- v4-shell-usage.txt
- v4-shell-coverage-matrix.md

Rules:
- Claude Code audit must cite real paths from these files.
- Any route, component, or page not found in these evidence files must be marked as UNVERIFIED.
- Do not invent pages such as /about or /lab unless they appear in app-file-list.txt.
