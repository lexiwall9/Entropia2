import re
from pathlib import Path

from PIL import Image
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(r"D:\Ing. de Sistemas\7_semestre\LenguajesProgramacion\FinalPython")
SLIDES_DIR = ROOT / "outputs" / "exposicion_entropia_informacion_mutua"
OUT = ROOT / "outputs" / "exposicion_entropia_informacion_mutua.pdf"


def main():
    def slide_number(path):
        match = re.search(r"slide-(\d+)\.png$", path.name)
        return int(match.group(1)) if match else 0

    slides = sorted(SLIDES_DIR.glob("slide-*.png"), key=slide_number)
    if not slides:
        raise SystemExit(f"No slide images found in {SLIDES_DIR}")

    first = Image.open(slides[0])
    width, height = first.size
    first.close()

    pdf = canvas.Canvas(str(OUT), pagesize=(width, height))
    for slide_path in slides:
        with Image.open(slide_path) as image:
            if image.mode != "RGB":
                image = image.convert("RGB")
            pdf.drawImage(ImageReader(image), 0, 0, width=width, height=height)
        pdf.showPage()
    pdf.save()
    print(OUT)


if __name__ == "__main__":
    main()
