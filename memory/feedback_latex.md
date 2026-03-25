---
name: LaTeX compile and template preferences
description: How to handle this project's LaTeX setup
type: feedback
---

Use XeLaTeX (not pdflatex) — document uses fontspec with Helvetica Neue.

**Why:** fontspec requires XeLaTeX or LuaLaTeX.

**How to apply:** Always compile with `xelatex -interaction=nonstopmode main.tex`. For bibliography changes, run full cycle: xelatex → bibtex → xelatex → xelatex. Working directory must be docs/proposal/ since iyte_logo.png is there.

Professor's template requirements (CENG318_Project_Proposal_Format.tex):
- documentclass 14pt
- natbib package + chicago style + \bibliography{references}
- iyte_logo.png at scale=0.35 on cover page
- Sections: Introduction, Problem Definition, Literature Review, Stages, Tools/Software/Hardware, Experiments&Results, Weekly Schedule
