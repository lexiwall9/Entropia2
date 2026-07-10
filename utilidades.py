from PIL import ImageFont

from config import BASE_DIR, DIR_DATASETS, DIR_GRAFICOS, DIR_TABLAS


def preparar_carpetas():
    for carpeta in [DIR_DATASETS, DIR_TABLAS, DIR_GRAFICOS]:
        carpeta.mkdir(parents=True, exist_ok=True)


def encabezado(titulo):
    print("\n" + "=" * 90)
    print(titulo)
    print("=" * 90)


def subencabezado(titulo):
    print("\n" + "-" * 90)
    print(titulo)
    print("-" * 90)


def guardar_csv(df, ruta, index=False):
    df.to_csv(ruta, index=index)
    print(f"Archivo generado: {ruta.relative_to(BASE_DIR)}")


def pausar(mensaje="Presione Enter para continuar con la siguiente fase..."):
    input("\n" + mensaje)


def fuente(tamano=14):
    try:
        return ImageFont.truetype("arial.ttf", tamano)
    except OSError:
        return ImageFont.load_default()


def texto_centrado(draw, posicion, texto, font, fill):
    x, y = posicion
    bbox = draw.textbbox((0, 0), texto, font=font)
    ancho = bbox[2] - bbox[0]
    alto = bbox[3] - bbox[1]
    draw.text((x - ancho / 2, y - alto / 2), texto, font=font, fill=fill)
