import numpy as np
import pandas as pd

from config import DIR_TABLAS
from formulas import (
    arbol_kruskal,
    arbol_prim,
    construir_aristas_desde_matriz,
    construir_grafo_desde_matriz,
    matriz_caminos,
)
from graficos import graficar_arbol, graficar_comparacion_arboles, graficar_grafo_completo
from utilidades import encabezado, guardar_csv, subencabezado


def fase_7_grafo_ponderado(matrices):
    encabezado("FASE 7: CONSTRUCCION DEL GRAFO PONDERADO")
    print("Cada variable es un nodo.")
    print("Cada arista Xi -- Xj usa como peso la informacion mutua I(Xi;Xj).")
    print("La diagonal no se usa como arista porque I(Xi;Xi) representa la entropia de la variable.")

    grafos = {}

    for caso, matriz in matrices.items():
        subencabezado(f"GRAFO COMPLETO - {caso}")
        aristas = construir_aristas_desde_matriz(matriz)
        grafo = construir_grafo_desde_matriz(matriz)
        grafos[caso] = grafo

        print(f"Nodos: {len(grafo['nodos'])}")
        print(f"Aristas: {len(grafo['aristas'])}")
        print("\nAristas ordenadas de mayor a menor IM:")
        print(aristas.round(6).to_string(index=False))

        guardar_csv(aristas, DIR_TABLAS / f"aristas_grafo_{caso.lower()}.csv")
        graficar_grafo_completo(grafo, caso)

    return grafos


def guardar_aristas_arbol(arbol, ruta):
    datos = [
        {"origen": origen, "destino": destino, "peso": float(peso)}
        for origen, destino, peso in arbol["aristas"]
    ]

    df = pd.DataFrame(datos).sort_values(by="peso", ascending=False).reset_index(drop=True)
    guardar_csv(df, ruta)
    return df


def imprimir_arbol(arbol, algoritmo):
    aristas_ordenadas = sorted(arbol["aristas"], key=lambda item: item[2], reverse=True)
    peso_total = 0.0

    print(f"\nArbol por {algoritmo.upper()}:")
    for origen, destino, peso in aristas_ordenadas:
        peso_total += peso
        print(f"  {origen} -- {destino} | peso = {peso:.6f}")

    print(f"Peso total {algoritmo.upper()}: {peso_total:.6f}")
    return peso_total


def fase_8_arboles_expansion(grafos):
    encabezado("FASE 8: ARBOL DE EXPANSION DE MAXIMA DEPENDENCIA")
    print("Se usa maximum spanning tree porque queremos conservar las relaciones con mayor IM.")
    print("Equivalencia con la idea del MST de la imagen:")
    print("  En costos se eligen pesos pequenos.")
    print("  En dependencia informativa se eligen pesos grandes de IM.")
    print("Criterio: conectar todas las variables sin ciclos usando n-1 aristas.")

    arboles = {}

    for caso, grafo in grafos.items():
        subencabezado(f"MST DE MAXIMA DEPENDENCIA - {caso}")
        print(f"Nodos del grafo: {len(grafo['nodos'])}")
        print(f"Aristas del grafo completo: {len(grafo['aristas'])}")
        print(f"Aristas esperadas en el arbol: {len(grafo['nodos']) - 1}")

        print("\nAristas candidatas ordenadas por peso:")
        for origen, destino, peso in sorted(grafo["aristas"], key=lambda item: item[2], reverse=True):
            print(f"  {origen} -- {destino} | I = {peso:.6f}")

        mst_prim = arbol_prim(grafo)
        mst_kruskal = arbol_kruskal(grafo)

        peso_prim = imprimir_arbol(mst_prim, "prim")
        peso_kruskal = imprimir_arbol(mst_kruskal, "kruskal")

        if np.isclose(peso_prim, peso_kruskal):
            print("Validacion: Prim y Kruskal obtienen el mismo peso total.")
        else:
            print("Advertencia: Prim y Kruskal obtuvieron pesos diferentes.")

        df_prim = guardar_aristas_arbol(mst_prim, DIR_TABLAS / f"arbol_prim_{caso.lower()}.csv")
        df_kruskal = guardar_aristas_arbol(mst_kruskal, DIR_TABLAS / f"arbol_kruskal_{caso.lower()}.csv")
        graficar_arbol(mst_prim, caso, "prim")
        graficar_arbol(mst_kruskal, caso, "kruskal")

        arboles[caso] = {
            "prim": mst_prim,
            "kruskal": mst_kruskal,
            "df_prim": df_prim,
            "df_kruskal": df_kruskal,
        }

    if "BEST" in arboles and "WORST" in arboles:
        graficar_comparacion_arboles(arboles["BEST"]["kruskal"], arboles["WORST"]["kruskal"])

    return arboles


def fase_9_comparacion_final(arboles):
    encabezado("FASE 9: COMPARACION FINAL BEST VS WORST")
    print("Se compara la suma de pesos de los caminos dentro del arbol Kruskal.")
    print("Para cada par de variables se suma la IM de las aristas que forman su camino en el arbol.")

    matrices_caminos = {}

    for caso, info in arboles.items():
        subencabezado(f"MATRIZ DE CAMINOS - {caso}")
        matriz = matriz_caminos(info["kruskal"])
        matrices_caminos[caso] = matriz
        print(matriz.round(6).to_string())
        guardar_csv(matriz, DIR_TABLAS / f"matriz_caminos_{caso.lower()}.csv", index=True)

    if "BEST" in matrices_caminos and "WORST" in matrices_caminos:
        suma_best = matrices_caminos["BEST"].sum(axis=1)
        suma_worst = matrices_caminos["WORST"].sum(axis=1)

        comparacion = pd.DataFrame(
            {
                "Variable": suma_best.index,
                "Suma_BEST": suma_best.values,
                "Suma_WORST": suma_worst.values,
            }
        )
        comparacion["Diferencia"] = comparacion["Suma_BEST"] - comparacion["Suma_WORST"]
        comparacion["Diferencia_Absoluta"] = comparacion["Diferencia"].abs()
        comparacion = comparacion.sort_values(by="Diferencia_Absoluta", ascending=False)

        print("\nComparacion ordenada por mayor diferencia absoluta:")
        print(comparacion.round(6).to_string(index=False))

        print("\nInterpretacion:")
        for _, fila in comparacion.iterrows():
            variable = fila["Variable"]
            if fila["Diferencia"] > 0:
                print(f"  {variable}: mayor recorrido acumulado en BEST.")
            elif fila["Diferencia"] < 0:
                print(f"  {variable}: mayor recorrido acumulado en WORST.")
            else:
                print(f"  {variable}: recorrido acumulado igual en BEST y WORST.")

        guardar_csv(comparacion, DIR_TABLAS / "comparacion_matriz_caminos.csv")
        return comparacion

    return None
