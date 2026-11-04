#!/usr/bin/env python3
"""Genera los manuales de la Librería Cartagena en DOCX y PDF.

Uso:  python3 docs/generar-manuales.py

Toma como fuente los Markdown de esta misma carpeta, les pone una portada
con el logo de la UAdeO, la materia (SOA), la tienda, los integrantes y la
fecha, y convierte el resultado con LibreOffice (soffice) a .docx y .pdf.

Requisitos: python3 con la librería `markdown` y LibreOffice (`soffice`).
"""
import base64
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import markdown

DOCS = Path(__file__).resolve().parent          # carpeta docs/
LOGO = DOCS / "logo-uadeo.png"
SALIDA = DOCS                                    # .docx / .pdf finales
PERFIL = "file:///tmp/opencode/soffice-perfil"   # perfil aislado de LibreOffice

MATERIA = "SOA"
TIENDA = "Librería Cartagena"
FECHA = "03 de noviembre de 2026"
VINO = "#982850"                                 # color del logo UAdeO

INTEGRANTES = [
    ("Sarahi Yamileth García Bojórquez", "23020009"),
    ("Aranzazú Acosta Medina", "23021126"),
    ("Alan Zayas Maldonado", "23020112"),
    ("Cesar Omar Karass Cota", "23020143"),
]

# (archivo, título, bajada, ¿tiene portada?)
# Sin portada va el tríptico: son dos hojas exactas para imprimir.
MANUALES = [
    ("Manual-de-Usuario", "Manual de Usuario",
     "Guía de uso para clientes y administradores de la tienda en línea.", True),
    ("Manual-Tecnico", "Manual Técnico",
     "Arquitectura, despliegue y mantenimiento para el equipo de desarrollo.", True),
    ("Triptico-Guia-Rapida", "Guía Rápida",
     "Dos hojas para imprimir: cómo funciona la página.", False),
]

CSS = """
@page { margin: 2cm; }
body { font-family: "Liberation Sans", Arial, Helvetica, sans-serif;
       font-size: 11pt; color: #212121; line-height: 1.42; }
h1 { font-size: 20pt; color: %(vino)s; margin: 0 0 6pt 0; }
h2 { font-size: 14pt; color: %(vino)s; margin: 16pt 0 6pt 0;
     border-bottom: 1.5pt solid %(vino)s; padding-bottom: 2pt; }
h3 { font-size: 12pt; color: #333333; margin: 12pt 0 4pt 0; }
p  { margin: 4pt 0; text-align: justify; }
ul, ol { margin: 4pt 0 8pt 18pt; }
li { margin: 2pt 0; }
table { border-collapse: collapse; width: 100%%; margin: 8pt 0 12pt 0;
        font-size: 10pt; }
th { color: #ffffff; border: 0.75pt solid #8c8c8c; padding: 4pt 6pt;
     text-align: left; }
td { border: 0.75pt solid #8c8c8c; padding: 4pt 6pt; vertical-align: top;
     text-align: left; }
code { font-family: "DejaVu Sans Mono", "Liberation Mono", monospace;
       font-size: 9.5pt; background: #eeeeee; }
pre { font-family: "DejaVu Sans Mono", "Liberation Mono", monospace;
      font-size: 8.5pt; border: 0.75pt solid #bbbbbb;
      padding: 6pt; margin: 8pt 0; white-space: pre; }
pre code { background: none; font-size: 8.5pt; }
blockquote { margin: 8pt 0; padding: 4pt 10pt; border-left: 3pt solid %(vino)s;
             color: #444444; }
.figura { margin: 10pt 0 4pt 0; text-align: center;
          page-break-inside: avoid; }
.figura img { border: 0.75pt solid #bbbbbb; }
.piefig { font-size: 9pt; color: #666666; font-style: italic;
          margin: 3pt 0 10pt 0; text-align: center; }
hr { border: none; border-top: 0.75pt solid #bbbbbb; margin: 12pt 0; }
a { color: %(vino)s; text-decoration: none; }
"""

TRIPTICO_CSS = """
@page { margin: 1cm; }
body { font-size: 8.7pt; line-height: 1.17; }
h1 { font-size: 13.5pt; margin: 0 0 3pt 0; }
h2 { font-size: 10.2pt; margin: 5pt 0 1pt 0; padding-bottom: 1pt; }
h3 { font-size: 9.2pt; margin: 4pt 0 1pt 0; }
p  { margin: 1.5pt 0; }
ul, ol { margin: 1.5pt 0 3pt 14pt; }
li { margin: 0.5pt 0; }
table { margin: 2pt 0 4pt 0; font-size: 7.9pt; }
th, td { padding: 1.4pt 3.5pt; }
blockquote { margin: 2.5pt 0; padding: 1.5pt 5pt; }
code { font-size: 8pt; }
hr { margin: 6pt 0; }
"""

PORTADA_CSS = """
.portada { text-align: center; }
.portada .logo { width: 5cm; margin: 0 auto 6pt auto; }
.portada .escuela { font-size: 10.5pt; letter-spacing: 1.5pt; color: #666666;
                    margin: 0 0 2pt 0; }
.portada .materia { font-size: 13pt; color: %(vino)s; margin: 14pt 0 2pt 0; }
.portada .materia b { font-size: 20pt; }
.portada .titulo { font-size: 27pt; color: %(vino)s; font-weight: bold;
                   margin: 4pt 0; }
.portada .tienda { font-size: 13pt; color: #333333; margin: 2pt 0 2pt 0; }
.portada .bajada { font-size: 10pt; color: #666666; margin: 0 0 10pt 0; }
.portada .regla { border-top: 2.5pt solid %(vino)s; width: 60%%;
                  margin: 0 auto 10pt auto; }
.portada .rotulo { font-size: 11pt; color: %(vino)s; margin: 0 0 4pt 0; }
.portada table.integrantes { width: 80%%; margin: 0 auto; font-size: 10.5pt; }
.portada table.integrantes td { padding: 3pt 6pt; }
.portada td.num { text-align: center; white-space: nowrap; }
.portada .fecha { margin-top: 14pt; font-size: 11pt; color: #333333; }
.portada .pie { margin-top: 16pt; font-size: 9pt; color: #888888; }
"""


def incrustar_imagenes(html: str, ancho: int = 540) -> str:
    """Convierte las rutas locales de <img> en data URI y las envuelve en figura.

    LibreOffice guarda las imágenes referenciadas por ruta como *vínculos*
    (se pierden al abrir el DOCX en otra máquina), en cambio con un data URI
    las incrusta dentro del archivo. El `width` fijo sí lo respeta al importar,
    a diferencia de `max-width` en CSS.
    """
    def figura(m: re.Match) -> str:
        attrs = m.group(1)
        alt = (re.search(r'alt="([^"]*)"', attrs) or [None, ""])[1]
        src = (re.search(r'src="([^"]*)"', attrs) or [None, ""])[1]

        if not src.startswith(("http://", "https://", "data:")):
            archivo = (DOCS / src).resolve()
            if not archivo.exists():
                print(f"    AVISO: no existe la imagen {src}")
            else:
                mime = "image/png" if archivo.suffix.lower() == ".png" else "image/jpeg"
                b64 = base64.b64encode(archivo.read_bytes()).decode()
                src = f"data:{mime};base64,{b64}"

        pie = f'<p class="piefig">{alt}</p>' if alt else ""
        return (f'<div class="figura"><img src="{src}" alt="{alt}" '
                f'width="{ancho}">{pie}</div>')

    # markdown envuelve la imagen en <p>; lo abrimos para poder insertar el pie.
    html = re.sub(r"<p>\s*(<img[^>]*>)\s*</p>", r"\1", html)
    return re.sub(r"<img([^>]*)>", figura, html)


def posproceso(html: str) -> str:
    """Ajustes que LibreOffice necesita para que el HTML salga bien.

    - Dibuja bordes de tabla solo si la etiqueta trae el atributo `border`.
    - Ignora el color de fondo en CSS: hay que usar el atributo `bgcolor`.
    - Descarta el contenido de <thead> (se pierde la fila de encabezado).
    """
    html = html.replace("<thead>", "").replace("</thead>", "")
    html = html.replace("<tbody>", "").replace("</tbody>", "")
    html = html.replace("<table>", '<table border="1">')
    html = html.replace("<th>",
                        '<th bgcolor="%s" style="color:#ffffff">' % VINO)
    return html


def portada(titulo: str, bajada: str) -> str:
    filas = "\n".join(
        f'      <tr><td>{n}</td><td class="num">{c}</td></tr>'
        for n, c in INTEGRANTES)
    # Las imágenes referenciadas por ruta quedan *vinculadas* (no incrustadas)
    # en el ODT/DOCX: con data URI LibreOffice las guarda dentro del archivo.
    b64 = base64.b64encode(LOGO.read_bytes()).decode()
    return f"""<div class="portada">
  <img class="logo" src="data:image/png;base64,{b64}"
       width="170" height="170" alt="Logo UAdeO">
  <p class="escuela">UNIVERSIDAD AUTÓNOMA DE OCCIDENTE</p>
  <div class="regla"></div>
  <p class="materia">Materia<br><b>{MATERIA}</b></p>
  <p class="titulo">{titulo}</p>
  <p class="tienda">{TIENDA} — tienda en línea</p>
  <p class="bajada">{bajada}</p>
  <div class="regla"></div>
  <p class="rotulo">Integrantes</p>
  <table class="integrantes">
    <tr><th>Nombre</th><th>Número de cuenta</th></tr>
{filas}
  </table>
  <p class="fecha">Fecha de creación: {FECHA}</p>
  <p class="pie">Documento académico — Materia {MATERIA} · {TIENDA}</p>
</div>
"""


def construir_html(nombre: str, titulo: str, bajada: str, destino: Path,
                   con_portada: bool = True) -> Path:
    md = (DOCS / f"{nombre}.md").read_text(encoding="utf-8")
    cuerpo = markdown.markdown(
        md, extensions=["tables", "fenced_code", "sane_lists", "toc"])
    cuerpo = incrustar_imagenes(cuerpo, ancho=430 if not con_portada else 540)
    css_extra = "" if con_portada else "\n%s\n" % (TRIPTICO_CSS % {'vino': VINO})
    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>{titulo} — {TIENDA}</title>
<style>
{CSS % {'vino': VINO}}
{css_extra}
{PORTADA_CSS % {'vino': VINO} if con_portada else ''}
</style>
</head>
<body>
{portada(titulo, bajada) if con_portada else ''}
<div class="contenido">
{cuerpo}
</div>
</body>
</html>
"""
    html = posproceso(html)
    # La portada ocupa la página 1; el contenido empieza en la 2. LibreOffice
    # aplica page-break-before al primer elemento de bloque, no al div contenedor.
    if con_portada:
        html = re.sub(r"<h1(?![^>]*page-break)",
                      '<h1 style="page-break-before: always"', html, count=1)
    else:
        # Tríptico: la 2.ª hoja arranca en papel nuevo (el 1.er h1 es el
        # título de la hoja 1 y NO debe saltar).
        html = saltar_en_h1(html, n=2)
    salida = destino / f"{nombre}.html"
    salida.write_text(html, encoding="utf-8")
    return salida


def saltar_en_h1(html: str, n: int) -> str:
    """Pone page-break-before al n-ésimo <h1> (1-based)."""
    contador = {"i": 0}

    def reemplazo(m: re.Match) -> str:
        contador["i"] += 1
        if contador["i"] == n:
            return '<h1 style="page-break-before: always"'
        return m.group(0)

    return re.sub(r"<h1(?![^>]*page-break)", reemplazo, html)


def convertir(entrada: Path, fmt: str, salida: Path) -> Path | None:
    cmd = ["soffice", f"-env:UserInstallation={PERFIL}",
           "--headless", "--norestore",
           "--convert-to", fmt, "--outdir", str(salida), str(entrada)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    destino = salida / (entrada.stem + "." + fmt.split(":")[0])
    if not destino.exists():
        print(f"    FALLÓ {fmt}: {r.stdout} {r.stderr}")
        return None
    print(f"    {fmt} -> {destino.name}")
    return destino


def main():
    if not LOGO.exists():
        raise SystemExit(f"Falta el logo: {LOGO}")
    if not shutil.which("soffice"):
        raise SystemExit("No se encontró soffice (LibreOffice).")

    with tempfile.TemporaryDirectory(prefix="manuales-") as tmp:
        tmpdir = Path(tmp)
        for nombre, titulo, bajada, con_portada in MANUALES:
            print(f"== {nombre}")
            html = construir_html(nombre, titulo, bajada, tmpdir, con_portada)
            print(f"    html -> {html.name}")
            odt = convertir(html, "odt", tmpdir)
            if odt:
                convertir(odt, "docx", SALIDA)
                convertir(odt, "pdf", SALIDA)
    print("Listos en", SALIDA)


if __name__ == "__main__":
    main()
