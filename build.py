"""Assemble index.html from src/. The 100 signature pieces live in src/signature-items.js."""
from pathlib import Path
root = Path(__file__).parent
shell = (root / "src/shell.html").read_text(encoding="utf8")
page = (shell.replace("/*__ORIGINAL_ITEMS__*/", (root / "src/signature-items.js").read_text(encoding="utf8"))
             .replace("/*__DATA2__*/", (root / "src/data.js").read_text(encoding="utf8"))
             .replace("/*__APP__*/", (root / "src/app.js").read_text(encoding="utf8")))
head = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n')
(root / "index.html").write_text(head + page + "\n</body>\n</html>\n", encoding="utf8")
print("built index.html")
