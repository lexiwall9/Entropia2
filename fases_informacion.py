import numpy as np
import pandas as pd

from config import DIR_TABLAS
from formulas import calcular_entropia, calcular_matriz_im, informacion_mutua
from graficos import graficar_barras_entropia, graficar_comparacion_entropias, graficar_heatmap
from utilidades import encabezado, guardar_csv, subencabezado


def fase_5_entropia_individual(datasets_sin_y):
    encabezado("FASE 5: ENTROPIA INDIVIDUAL DE CADA VARIABLE")
    print("Formula de Shannon:")
    print("  H(X) = - sum_x P(x) * log2(P(x))")
    print("Interpretacion: mide la incertidumbre o variabilidad de cada variable.")

    resultados = []

    for caso, df in datasets_sin_y.items():
        subencabezado(f"ENTROPIAS - {caso}")
        print(f"Registros analizados: {len(df)}")

        for columna in df.columns:
            frecuencias, probabilidades, entropia = calcular_entropia(df[columna])

            print(f"\nVariable {columna}")
            print("Valor | Frecuencia | Probabilidad | Termino -p*log2(p)")
            print("------+------------+--------------+-------------------")
            for valor in frecuencias.index:
                frecuencia = int(frecuencias.loc[valor])
                probabilidad = float(probabilidades.loc[valor])
                termino = -probabilidad * np.log2(probabilidad)
                print(f"{valor:>5} | {frecuencia:>10} | {probabilidad:>12.6f} | {termino:>17.6f}")

            print(f"H({columna}) = {entropia:.6f} bits")
            resultados.append({"Caso": caso, "Variable": columna, "Entropia": entropia})

    df_resultados = pd.DataFrame(resultados)
    guardar_csv(df_resultados, DIR_TABLAS / "resultados_entropia_individual.csv")
    for caso in datasets_sin_y:
        graficar_barras_entropia(df_resultados, caso)
    graficar_comparacion_entropias(df_resultados)
    return df_resultados


def fase_6_matriz_informacion_mutua(datasets_sin_y):
    encabezado("FASE 6: MATRIZ DE INFORMACION MUTUA")
    print("Formula:")
    print("  I(X;Y) = sum_x sum_y P(x,y) * log2(P(x,y) / (P(x) * P(y)))")
    print("Propiedades esperadas:")
    print("  La matriz es simetrica.")
    print("  La diagonal I(X;X) coincide con H(X).")
    print("  IM = 0 indica independencia estadistica aproximada.")

    matrices = {}

    for caso, df in datasets_sin_y.items():
        subencabezado(f"MATRIZ IM - {caso}")
        matriz = calcular_matriz_im(df)
        matrices[caso] = matriz

        print(matriz.round(6).to_string())

        print("\nDetalle de calculo por pares:")
        for i, var_x in enumerate(df.columns):
            for var_y in df.columns[i + 1 :]:
                im, tabla_conjunta, detalles = informacion_mutua(df[var_x], df[var_y])
                print(f"\nPar {var_x} - {var_y}")
                print(f"Tabla conjunta P({var_x},{var_y}):")
                print(tabla_conjunta.round(6).to_string())
                print("Terminos no nulos usados en la sumatoria:")
                for item in detalles:
                    print(
                        f"  x={item['x']}, y={item['y']}: "
                        f"Pxy={item['p_xy']:.6f}, Px={item['p_x']:.6f}, Py={item['p_y']:.6f}, "
                        f"termino={item['termino']:.6f}"
                    )
                print(f"I({var_x};{var_y}) = {im:.6f} bits")

        guardar_csv(matriz, DIR_TABLAS / f"matriz_IM_{caso.lower()}.csv", index=True)
        graficar_heatmap(matriz, caso)

    return matrices
