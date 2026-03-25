# CENG318 Human Computer Interaction — Project

**NewsPress Widget Studio: A Three-Tiered Personalization System for Subscription-Based Media Platforms**

## Kurulum (Setup)

### LaTeX Kurulumu (macOS)

Projeyi yerel olarak derleyebilmek için MacTeX gereklidir:

```bash
brew install --cask mactex
```

> **Not:** MacTeX ~7GB'tır, indirmesi zaman alabilir.

Kurulumun ardından LaTeX binary'lerini PATH'e ekleyin:

```bash
echo 'export PATH="/Library/TeX/texbin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Derleme

```bash
cd docs/proposal
make        # latexmk ile otomatik derle
# veya
make pdf    # xelatex ile manuel iki geçişli derle
make clean  # ara dosyaları temizle
```

Çıktı: `docs/proposal/main.pdf`

## Proje Yapısı

```
ceng318-project/
├── docs/
│   └── proposal/
│       ├── main.tex        # LaTeX kaynak
│       ├── main.pdf        # Derlenmiş PDF
│       └── Makefile        # Derleme komutları
└── papers/                 # Referans makaleler
```

## Grup Üyeleri

- Student_1 full name & Id
- Student_2 full name & Id
- Student_3 full name & Id
