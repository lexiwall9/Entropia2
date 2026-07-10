import numpy as np
import pandas as pd


def calcular_entropia(serie):
    frecuencias = serie.value_counts().sort_index()
    probabilidades = frecuencias / frecuencias.sum()
    entropia = -np.sum(probabilidades * np.log2(probabilidades))
    return frecuencias, probabilidades, float(entropia)


def informacion_mutua(serie_x, serie_y):
    n = len(serie_x)
    px = serie_x.value_counts() / n
    py = serie_y.value_counts() / n
    tabla_conjunta = pd.crosstab(serie_x, serie_y) / n

    im = 0.0
    detalles = []

    for valor_x in tabla_conjunta.index:
        for valor_y in tabla_conjunta.columns:
            pxy = float(tabla_conjunta.loc[valor_x, valor_y])
            if pxy > 0:
                termino = pxy * np.log2(pxy / (px.loc[valor_x] * py.loc[valor_y]))
                im += termino
                detalles.append(
                    {
                        "x": valor_x,
                        "y": valor_y,
                        "p_xy": pxy,
                        "p_x": float(px.loc[valor_x]),
                        "p_y": float(py.loc[valor_y]),
                        "termino": float(termino),
                    }
                )

    return float(im), tabla_conjunta, detalles


def calcular_matriz_im(df):
    variables = list(df.columns)
    matriz = pd.DataFrame(0.0, index=variables, columns=variables)

    for var_x in variables:
        for var_y in variables:
            im, _, _ = informacion_mutua(df[var_x], df[var_y])
            matriz.loc[var_x, var_y] = im

    return matriz


def construir_aristas_desde_matriz(matriz):
    variables = list(matriz.columns)
    aristas = []

    for i, origen in enumerate(variables):
        for destino in variables[i + 1 :]:
            aristas.append(
                {
                    "origen": origen,
                    "destino": destino,
                    "peso": float(matriz.loc[origen, destino]),
                }
            )

    return pd.DataFrame(aristas).sort_values(by="peso", ascending=False).reset_index(drop=True)


def construir_grafo_desde_matriz(matriz):
    return {
        "nodos": list(matriz.columns),
        "aristas": [
            (fila["origen"], fila["destino"], float(fila["peso"]))
            for _, fila in construir_aristas_desde_matriz(matriz).iterrows()
        ],
    }


def encontrar(padre, nodo):
    while padre[nodo] != nodo:
        padre[nodo] = padre[padre[nodo]]
        nodo = padre[nodo]
    return nodo


def unir(padre, rango, a, b):
    raiz_a = encontrar(padre, a)
    raiz_b = encontrar(padre, b)
    if raiz_a == raiz_b:
        return False
    if rango[raiz_a] < rango[raiz_b]:
        padre[raiz_a] = raiz_b
    elif rango[raiz_a] > rango[raiz_b]:
        padre[raiz_b] = raiz_a
    else:
        padre[raiz_b] = raiz_a
        rango[raiz_a] += 1
    return True


def arbol_kruskal(grafo):
    padre = {nodo: nodo for nodo in grafo["nodos"]}
    rango = {nodo: 0 for nodo in grafo["nodos"]}
    aristas_arbol = []

    for origen, destino, peso in sorted(grafo["aristas"], key=lambda item: item[2], reverse=True):
        if unir(padre, rango, origen, destino):
            aristas_arbol.append((origen, destino, peso))
        if len(aristas_arbol) == len(grafo["nodos"]) - 1:
            break

    return {"nodos": grafo["nodos"], "aristas": aristas_arbol}


def arbol_prim(grafo):
    nodos = grafo["nodos"]
    if not nodos:
        return {"nodos": [], "aristas": []}

    visitados = {nodos[0]}
    aristas_arbol = []

    while len(visitados) < len(nodos):
        candidatas = [
            (origen, destino, peso)
            for origen, destino, peso in grafo["aristas"]
            if (origen in visitados and destino not in visitados)
            or (destino in visitados and origen not in visitados)
        ]
        if not candidatas:
            raise ValueError("El grafo no esta conectado; no se puede formar arbol.")

        origen, destino, peso = max(candidatas, key=lambda item: item[2])
        aristas_arbol.append((origen, destino, peso))
        visitados.add(origen)
        visitados.add(destino)

    return {"nodos": nodos, "aristas": aristas_arbol}


def matriz_caminos(arbol):
    variables = sorted(arbol["nodos"])
    matriz = pd.DataFrame(0.0, index=variables, columns=variables)
    adyacencias = {nodo: [] for nodo in variables}

    for origen, destino, peso in arbol["aristas"]:
        adyacencias[origen].append((destino, peso))
        adyacencias[destino].append((origen, peso))

    def buscar_camino(origen, destino):
        pila = [(origen, 0.0)]
        visitados = set()
        while pila:
            actual, suma = pila.pop()
            if actual == destino:
                return suma
            if actual in visitados:
                continue
            visitados.add(actual)
            for vecino, peso in adyacencias[actual]:
                if vecino not in visitados:
                    pila.append((vecino, suma + peso))
        raise ValueError(f"No existe camino entre {origen} y {destino}.")

    for origen in variables:
        for destino in variables:
            if origen != destino:
                matriz.loc[origen, destino] = buscar_camino(origen, destino)

    return matriz
