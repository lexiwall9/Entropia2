import math

import numpy as np
from PIL import Image, ImageDraw

from config import BASE_DIR, DIR_GRAFICOS
from utilidades import fuente, texto_centrado


DECIMALES_GRAFICOS = 5


def color_heatmap_claro(valor, maximo):
    proporcion = 0 if maximo <= 0 else max(0, min(1, valor / maximo))
    puntos = [
        (246, 251, 255),
        (216, 236, 255),
        (178, 222, 235),
        (170, 226, 196),
        (255, 238, 153),
    ]
    escala = proporcion * (len(puntos) - 1)
    i = min(int(escala), len(puntos) - 2)
    t = escala - i
    c1 = puntos[i]
    c2 = puntos[i + 1]
    return tuple(int(c1[k] + (c2[k] - c1[k]) * t) for k in range(3))


def color_texto_para_fondo(color):
    brillo = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000
    return "#17324d" if brillo > 145 else "white"


def graficar_heatmap(matriz, caso):
    ruta = DIR_GRAFICOS / f"heatmap_IM_{caso.lower()}.png"
    variables = list(matriz.columns)
    celda = 88
    margen_izq = 105
    margen_sup = 100
    margen_der = 190
    margen_inf = 60
    ancho = margen_izq + celda * len(variables) + margen_der
    alto = margen_sup + celda * len(variables) + margen_inf

    imagen = Image.new("RGB", (ancho, alto), "white")
    draw = ImageDraw.Draw(imagen)
    font_titulo = fuente(22)
    font = fuente(15)
    font_chica = fuente(12)
    maximo = float(np.max(matriz.values))

    texto_centrado(draw, (ancho / 2, 38), f"Matriz de informacion mutua - {caso}", font_titulo, "#0b2d5c")

    for i, var in enumerate(variables):
        texto_centrado(draw, (margen_izq + celda * i + celda / 2, margen_sup - 25), var, font, "#1f2933")
        texto_centrado(draw, (margen_izq - 35, margen_sup + celda * i + celda / 2), var, font, "#1f2933")

    for i, fila in enumerate(variables):
        for j, columna in enumerate(variables):
            valor = float(matriz.loc[fila, columna])
            x0 = margen_izq + celda * j
            y0 = margen_sup + celda * i
            color = color_heatmap_claro(valor, maximo)
            draw.rectangle([x0, y0, x0 + celda, y0 + celda], fill=color, outline="#c9d6e2")
            texto_centrado(
                draw,
                (x0 + celda / 2, y0 + celda / 2),
                f"{valor:.{DECIMALES_GRAFICOS}f}",
                font_chica,
                color_texto_para_fondo(color),
            )

    barra_x = margen_izq + celda * len(variables) + 40
    barra_y = margen_sup
    barra_alto = celda * len(variables)
    for y in range(barra_alto):
        valor = maximo * (1 - y / max(1, barra_alto - 1))
        draw.line(
            [(barra_x, barra_y + y), (barra_x + 26, barra_y + y)],
            fill=color_heatmap_claro(valor, maximo),
        )
    draw.rectangle([barra_x, barra_y, barra_x + 26, barra_y + barra_alto], outline="#1f2933")
    draw.text((barra_x + 36, barra_y - 5), f"{maximo:.{DECIMALES_GRAFICOS}f}", font=font_chica, fill="#1f2933")
    draw.text((barra_x + 36, barra_y + barra_alto - 12), f"{0:.{DECIMALES_GRAFICOS}f}", font=font_chica, fill="#1f2933")
    draw.text((barra_x - 8, barra_y + barra_alto + 16), "Informacion mutua", font=font_chica, fill="#1f2933")

    imagen.save(ruta)
    print(f"Grafico generado: {ruta.relative_to(BASE_DIR)}")
    return ruta


def graficar_barras_entropia(df_entropias, caso):
    ruta = DIR_GRAFICOS / f"entropia_{caso.lower()}.png"
    datos = df_entropias[df_entropias["Caso"] == caso].copy()
    variables = list(datos["Variable"])
    valores = [float(valor) for valor in datos["Entropia"]]

    ancho = 1050
    alto = 620
    margen_izq = 90
    margen_der = 40
    margen_sup = 80
    margen_inf = 105
    area_ancho = ancho - margen_izq - margen_der
    area_alto = alto - margen_sup - margen_inf
    maximo = max(valores) if valores else 1

    imagen = Image.new("RGB", (ancho, alto), "white")
    draw = ImageDraw.Draw(imagen)
    font_titulo = fuente(22)
    font = fuente(14)
    font_chica = fuente(12)

    texto_centrado(draw, (ancho / 2, 35), f"Entropia individual - {caso}", font_titulo, "#0b2d5c")

    x0 = margen_izq
    y0 = margen_sup + area_alto
    draw.line((margen_izq, margen_sup, margen_izq, y0), fill="#425466", width=2)
    draw.line((margen_izq, y0, ancho - margen_der, y0), fill="#425466", width=2)

    for i in range(5):
        valor = maximo * i / 4
        y = y0 - (valor / maximo) * area_alto
        draw.line((margen_izq - 5, y, ancho - margen_der, y), fill="#e4edf5", width=1)
        draw.text((18, y - 8), f"{valor:.2f}", font=font_chica, fill="#425466")

    espacio = area_ancho / max(1, len(variables))
    barra_ancho = min(70, espacio * 0.55)
    colores = ["#8cb9df", "#9fd6b3", "#f0c987", "#d9b8f1", "#89d2d6", "#f3a6a6", "#a9b7ff"]

    for i, (variable, valor) in enumerate(zip(variables, valores)):
        cx = x0 + espacio * i + espacio / 2
        barra_alto = (valor / maximo) * area_alto
        bx0 = cx - barra_ancho / 2
        bx1 = cx + barra_ancho / 2
        by0 = y0 - barra_alto
        color = colores[i % len(colores)]
        draw.rounded_rectangle([bx0, by0, bx1, y0], radius=5, fill=color, outline="#5b7083")
        texto_centrado(draw, (cx, by0 - 14), f"{valor:.{DECIMALES_GRAFICOS}f}", font_chica, "#1f2933")
        texto_centrado(draw, (cx, y0 + 22), variable, font, "#1f2933")

    draw.text((margen_izq, alto - 34), "Variables", font=font_chica, fill="#425466")
    draw.text((18, margen_sup - 30), "bits", font=font_chica, fill="#425466")

    imagen.save(ruta)
    print(f"Grafico generado: {ruta.relative_to(BASE_DIR)}")
    return ruta


def graficar_comparacion_entropias(df_entropias):
    ruta = DIR_GRAFICOS / "comparacion_entropias_best_worst.png"
    tabla = df_entropias.pivot(index="Variable", columns="Caso", values="Entropia")
    variables = list(df_entropias[df_entropias["Caso"] == "BEST"]["Variable"])
    best = [float(tabla.loc[var, "BEST"]) for var in variables]
    worst = [float(tabla.loc[var, "WORST"]) for var in variables]
    maximo = max(best + worst) if variables else 1

    ancho = 1150
    alto = 660
    margen_izq = 90
    margen_der = 55
    margen_sup = 115
    margen_inf = 125
    area_ancho = ancho - margen_izq - margen_der
    area_alto = alto - margen_sup - margen_inf
    y0 = margen_sup + area_alto

    imagen = Image.new("RGB", (ancho, alto), "white")
    draw = ImageDraw.Draw(imagen)
    font_titulo = fuente(22)
    font = fuente(14)
    font_chica = fuente(12)

    texto_centrado(draw, (ancho / 2, 35), "Comparacion de entropias - BEST vs WORST", font_titulo, "#0b2d5c")
    draw.line((margen_izq, margen_sup, margen_izq, y0), fill="#425466", width=2)
    draw.line((margen_izq, y0, ancho - margen_der, y0), fill="#425466", width=2)

    for i in range(5):
        valor = maximo * i / 4
        y = y0 - (valor / maximo) * area_alto
        draw.line((margen_izq - 5, y, ancho - margen_der, y), fill="#e4edf5", width=1)
        draw.text((18, y - 8), f"{valor:.2f}", font=font_chica, fill="#425466")

    espacio = area_ancho / max(1, len(variables))
    barra_ancho = min(38, espacio * 0.30)

    for i, variable in enumerate(variables):
        cx = margen_izq + espacio * i + espacio / 2
        for desplazamiento, valor, color, etiqueta in [
            (-barra_ancho / 1.8, best[i], "#8cb9df", "BEST"),
            (barra_ancho / 1.8, worst[i], "#f0c987", "WORST"),
        ]:
            barra_alto = (valor / maximo) * area_alto
            bx0 = cx + desplazamiento - barra_ancho / 2
            bx1 = cx + desplazamiento + barra_ancho / 2
            by0 = y0 - barra_alto
            draw.rounded_rectangle([bx0, by0, bx1, y0], radius=5, fill=color, outline="#5b7083")
            texto_centrado(draw, (cx + desplazamiento, by0 - 12), f"{valor:.{DECIMALES_GRAFICOS}f}", font_chica, "#1f2933")
        texto_centrado(draw, (cx, y0 + 24), variable, font, "#1f2933")

    draw.rectangle([ancho - 250, 62, ancho - 230, 82], fill="#8cb9df", outline="#5b7083")
    draw.text((ancho - 224, 62), "BEST", font=font_chica, fill="#1f2933")
    draw.rectangle([ancho - 170, 62, ancho - 150, 82], fill="#f0c987", outline="#5b7083")
    draw.text((ancho - 144, 62), "WORST", font=font_chica, fill="#1f2933")

    imagen.save(ruta)
    print(f"Grafico generado: {ruta.relative_to(BASE_DIR)}")
    return ruta


def posiciones_circulares(nodos, ancho, alto, radio):
    cx = ancho / 2
    cy = alto / 2 + 25
    posiciones = {}
    for i, nodo in enumerate(nodos):
        angulo = 2 * math.pi * i / len(nodos) - math.pi / 2
        posiciones[nodo] = (cx + radio * math.cos(angulo), cy + radio * math.sin(angulo))
    return posiciones


def normalizar_arista(origen, destino):
    return tuple(sorted((origen, destino)))


def dibujar_grafo(ruta, nodos, aristas, titulo, color_arista="#76a9d6"):
    ancho = 1100
    alto = 880
    imagen = Image.new("RGB", (ancho, alto), "white")
    draw = ImageDraw.Draw(imagen)
    font_titulo = fuente(22)
    font_nodo = fuente(16)
    font_peso = fuente(12)

    texto_centrado(draw, (ancho / 2, 38), titulo, font_titulo, "#0b2d5c")
    posiciones = posiciones_circulares(nodos, ancho, alto, 315)
    max_peso = max([peso for _, _, peso in aristas], default=1)

    for origen, destino, peso in aristas:
        x1, y1 = posiciones[origen]
        x2, y2 = posiciones[destino]
        grosor = int(1 + 6 * (peso / max_peso if max_peso else 0))
        draw.line((x1, y1, x2, y2), fill=color_arista, width=max(1, grosor))

        xm = (x1 + x2) / 2
        ym = (y1 + y2) / 2
        etiqueta = f"{peso:.{DECIMALES_GRAFICOS}f}"
        bbox = draw.textbbox((0, 0), etiqueta, font=font_peso)
        pad = 5
        draw.rounded_rectangle(
            [xm - (bbox[2] - bbox[0]) / 2 - pad, ym - 11, xm + (bbox[2] - bbox[0]) / 2 + pad, ym + 12],
            radius=5,
            fill="#f8fbff",
            outline="#b7c7d8",
        )
        texto_centrado(draw, (xm, ym), etiqueta, font_peso, "#1f2933")

    for nodo in nodos:
        x, y = posiciones[nodo]
        r = 34
        draw.ellipse([x - r, y - r, x + r, y + r], fill="#6aa6d8", outline="#1f5f96", width=2)
        texto_centrado(draw, (x, y), nodo, font_nodo, "white")

    imagen.save(ruta)
    print(f"Grafico generado: {ruta.relative_to(BASE_DIR)}")
    return ruta


def graficar_grafo_completo(grafo, caso):
    ruta = DIR_GRAFICOS / f"grafo_ponderado_{caso.lower()}.png"
    return dibujar_grafo(
        ruta,
        grafo["nodos"],
        grafo["aristas"],
        f"Grafo ponderado completo por IM - {caso}",
        color_arista="#8cb9df",
    )


def graficar_arbol(arbol, caso, algoritmo):
    ruta = DIR_GRAFICOS / f"arbol_{algoritmo.lower()}_{caso.lower()}.png"
    return dibujar_grafo(
        ruta,
        arbol["nodos"],
        arbol["aristas"],
        f"Arbol de maxima dependencia - {algoritmo.upper()} - {caso}",
        color_arista="#8ac7a3",
    )


def graficar_comparacion_arboles(arbol_best, arbol_worst):
    ruta = DIR_GRAFICOS / "comparacion_arboles_best_worst.png"
    nodos = arbol_best["nodos"]
    aristas_best = {normalizar_arista(o, d): p for o, d, p in arbol_best["aristas"]}
    aristas_worst = {normalizar_arista(o, d): p for o, d, p in arbol_worst["aristas"]}
    comunes = set(aristas_best) & set(aristas_worst)

    ancho_panel = 650
    alto = 720
    ancho = ancho_panel * 2
    imagen = Image.new("RGB", (ancho, alto), "white")
    draw = ImageDraw.Draw(imagen)
    font_titulo = fuente(22)
    font_nodo = fuente(15)
    font_peso = fuente(11)
    font_chica = fuente(12)

    texto_centrado(draw, (ancho / 2, 34), "Comparacion de arboles de maxima dependencia", font_titulo, "#0b2d5c")
    draw.line((ancho_panel, 70, ancho_panel, alto - 35), fill="#d7e2ec", width=2)

    def dibujar_panel(arbol, x_offset, titulo, aristas_otro):
        texto_centrado(draw, (x_offset + ancho_panel / 2, 78), titulo, fuente(18), "#0b2d5c")
        posiciones_base = posiciones_circulares(nodos, ancho_panel, alto, 210)
        posiciones = {nodo: (x + x_offset, y + 35) for nodo, (x, y) in posiciones_base.items()}
        max_peso = max([peso for _, _, peso in arbol["aristas"]], default=1)

        for origen, destino, peso in arbol["aristas"]:
            clave = normalizar_arista(origen, destino)
            x1, y1 = posiciones[origen]
            x2, y2 = posiciones[destino]
            color = "#70bf8f" if clave in comunes else "#ef9a62"
            grosor = int(2 + 6 * (peso / max_peso if max_peso else 0))
            draw.line((x1, y1, x2, y2), fill=color, width=max(2, grosor))
            xm = (x1 + x2) / 2
            ym = (y1 + y2) / 2
            etiqueta = f"{peso:.{DECIMALES_GRAFICOS}f}"
            bbox = draw.textbbox((0, 0), etiqueta, font=font_peso)
            draw.rounded_rectangle(
                [xm - (bbox[2] - bbox[0]) / 2 - 4, ym - 10, xm + (bbox[2] - bbox[0]) / 2 + 4, ym + 11],
                radius=4,
                fill="white",
                outline="#b7c7d8",
            )
            texto_centrado(draw, (xm, ym), etiqueta, font_peso, "#1f2933")

        for nodo in nodos:
            x, y = posiciones[nodo]
            r = 30
            draw.ellipse([x - r, y - r, x + r, y + r], fill="#6aa6d8", outline="#1f5f96", width=2)
            texto_centrado(draw, (x, y), nodo, font_nodo, "white")

        exclusivas = [clave for clave in aristas_best if clave not in aristas_worst] if titulo == "BEST" else [clave for clave in aristas_worst if clave not in aristas_best]
        y_texto = alto - 74
        draw.text((x_offset + 35, y_texto), "Verde: arista comun", font=font_chica, fill="#1f2933")
        draw.text((x_offset + 35, y_texto + 20), "Naranja: arista propia del caso", font=font_chica, fill="#1f2933")
        if exclusivas:
            propias = ", ".join([f"{a}-{b}" for a, b in exclusivas])
            draw.text((x_offset + 35, y_texto + 40), f"Propia: {propias}", font=font_chica, fill="#1f2933")

    dibujar_panel(arbol_best, 0, "BEST", aristas_worst)
    dibujar_panel(arbol_worst, ancho_panel, "WORST", aristas_best)

    imagen.save(ruta)
    print(f"Grafico generado: {ruta.relative_to(BASE_DIR)}")
    return ruta
