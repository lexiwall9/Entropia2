import pandas as pd

from config import ARCHIVO_ENTRADA, COLUMNAS_ANALISIS, COLUMNAS_ESPERADAS, DIR_DATASETS
from utilidades import encabezado, guardar_csv, subencabezado


def fase_1_cargar_dataset():
    encabezado("FASE 1: CARGA Y REVISION DEL DATASET ORIGINAL")

    if not ARCHIVO_ENTRADA.exists():
        raise FileNotFoundError(f"No se encontro el archivo: {ARCHIVO_ENTRADA}")

    df = pd.read_csv(ARCHIVO_ENTRADA)

    print(f"Archivo leido: {ARCHIVO_ENTRADA.name}")
    print(f"Cantidad total de registros: {len(df)}")
    print(f"Cantidad total de variables originales: {len(df.columns)}")
    print(f"Variables encontradas: {list(df.columns)}")
    print(f"Variables esperadas:   {COLUMNAS_ESPERADAS}")

    if list(df.columns) == COLUMNAS_ESPERADAS:
        print("Validacion de columnas: correcta.")
    else:
        print("Advertencia: las columnas no coinciden exactamente con el orden esperado.")

    print("\nPrimeras 5 filas:")
    print(df.head().to_string(index=False))

    print("\nConteo de valores por variable:")
    for columna in df.columns:
        print(f"\n{columna}:")
        conteo = df[columna].value_counts().sort_index()
        for valor, cantidad in conteo.items():
            print(f"  valor {valor}: {cantidad} registros")

    return df


def fase_2_validar_y_crear_objetivo(df):
    encabezado("FASE 2: VALIDACION DE x7 Y x8, CREACION DE LA VARIABLE Y")

    print("Objetivo: comprobar que x7 y x8 contienen la misma clase.")
    print("Si x7 == x8 en todos los registros, se fusionan como Y.")

    iguales = (df["x7"] == df["x8"]).sum()
    diferentes = len(df) - iguales

    print(f"Registros donde x7 == x8: {iguales}")
    print(f"Registros donde x7 != x8: {diferentes}")

    if diferentes > 0:
        casos = df.loc[df["x7"] != df["x8"], ["x7", "x8"]].head(10)
        print("\nPrimeros casos con diferencia:")
        print(casos.to_string(index=False))
        raise ValueError("No se puede crear Y porque x7 y x8 no coinciden en todos los registros.")

    df_con_y = df[COLUMNAS_ANALISIS].copy()
    df_con_y["Y"] = df["x7"]
    df_con_y = df_con_y.sort_values(by="Y", ascending=False).reset_index(drop=True)

    print("\nResultado: x7 y x8 coinciden en todos los registros.")
    print("Se crea Y = x7 = x8.")
    print("Interpretacion usada:")
    print("  Y = 1 -> BEST")
    print("  Y = 0 -> WORST")

    conteo_y = df_con_y["Y"].value_counts().sort_index()
    print("\nConteo de clases:")
    for valor, cantidad in conteo_y.items():
        etiqueta = "BEST" if valor == 1 else "WORST"
        print(f"  Y = {valor} ({etiqueta}): {cantidad} registros")

    guardar_csv(df_con_y, DIR_DATASETS / "d9_con_Y_ordenado.csv")
    return df_con_y


def fase_3_dividir_best_worst(df_con_y):
    encabezado("FASE 3: DIVISION DEL DATASET EN BEST Y WORST")

    df_best = df_con_y[df_con_y["Y"] == 1].reset_index(drop=True)
    df_worst = df_con_y[df_con_y["Y"] == 0].reset_index(drop=True)

    print("Criterio de separacion:")
    print("  BEST  = registros con Y = 1")
    print("  WORST = registros con Y = 0")
    print(f"Cantidad BEST: {len(df_best)}")
    print(f"Cantidad WORST: {len(df_worst)}")
    print(f"Verificacion: {len(df_best)} + {len(df_worst)} = {len(df_best) + len(df_worst)}")

    guardar_csv(df_best, DIR_DATASETS / "d9_best.csv")
    guardar_csv(df_worst, DIR_DATASETS / "d9_worst.csv")

    return {"BEST": df_best, "WORST": df_worst}


def fase_4_retirar_y(datasets):
    encabezado("FASE 4: RETIRAR Y PARA EL ANALISIS INTERNO")
    print("Motivo: dentro de BEST, Y siempre vale 1; dentro de WORST, Y siempre vale 0.")
    print("Por eso H(Y) = 0 en cada grupo y no aporta variacion para IM entre variables.")

    datasets_sin_y = {}

    for caso, df in datasets.items():
        subencabezado(f"DATASET {caso}")

        conteo_y = df["Y"].value_counts().sort_index()
        print("Conteo de Y:")
        for valor, cantidad in conteo_y.items():
            print(f"  Y = {valor}: {cantidad} registros")

        print(f"Valores unicos de Y: {df['Y'].nunique()}")
        if df["Y"].nunique() == 1:
            print("Validacion: Y es constante, se puede retirar.")
        else:
            print("Advertencia: Y no es constante, revisar la division.")

        df_sin_y = df.drop(columns=["Y"])
        print(f"Variables que quedan: {list(df_sin_y.columns)}")
        print(f"Dimension final: {df_sin_y.shape[0]} registros x {df_sin_y.shape[1]} variables")

        ruta = DIR_DATASETS / f"d9_{caso.lower()}_sin_Y.csv"
        guardar_csv(df_sin_y, ruta)
        datasets_sin_y[caso] = df_sin_y

    return datasets_sin_y
