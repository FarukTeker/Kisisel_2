MAIN = main
LATEX = xelatex
LATEXMK = latexmk

.PHONY: all clean

all:
	$(LATEXMK) -xelatex $(MAIN).tex

pdf:
	$(LATEX) $(MAIN).tex
	$(LATEX) $(MAIN).tex

clean:
	$(LATEXMK) -C
	rm -f *.aux *.log *.fls *.fdb_latexmk *.synctex.gz *.out *.toc
