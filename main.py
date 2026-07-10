from config import BASE_DIR, DIR_DATASETS, DIR_GRAFICOS, DIR_TABLAS
from fases_dataset import (
    fase_1_cargar_dataset,
    fase_2_validar_y_crear_objetivo,
    fase_3_dividir_best_worst,
    fase_4_retirar_y,
)
from fases_grafos import (
    fase_7_grafo_ponderado,
    fase_8_arboles_expansion,
    fase_9_comparacion_final,
)
from fases_informacion import fase_5_entropia_individual, fase_6_matriz_informacion_mutua
from utilidades import encabezado, pausar, preparar_carpetas


def resumen_final():
    encabezado("RESUMEN FINAL DEL PROCESO")
    print("Flujo ejecutado completo:")
    print("  1. Carga del dataset original.")
    print("  2. Validacion de x7 y x8.")
    print("  3. Creacion de Y y separacion BEST/WORST.")
    print("  4. Retiro de Y para analisis interno.")
    print("  5. Calculo de entropias individuales.")
    print("  6. Calculo de matrices de informacion mutua.")
    print("  7. Construccion de grafos ponderados.")
    print("  8. Obtencion de arboles por Prim y Kruskal.")
    print("  9. Comparacion de caminos BEST vs WORST.")
    print("\nCarpetas generadas:")
    print(f"  Datasets: {DIR_DATASETS.relative_to(BASE_DIR)}")
    print(f"  Tablas:   {DIR_TABLAS.relative_to(BASE_DIR)}")
    print(f"  Graficos: {DIR_GRAFICOS.relative_to(BASE_DIR)}")


def main():
    preparar_carpetas()

    df = fase_1_cargar_dataset()
    pausar()

    df_con_y = fase_2_validar_y_crear_objetivo(df)
    pausar()

    datasets = fase_3_dividir_best_worst(df_con_y)
    pausar()

    datasets_sin_y = fase_4_retirar_y(datasets)
    pausar()

    fase_5_entropia_individual(datasets_sin_y)
    pausar()

    matrices = fase_6_matriz_informacion_mutua(datasets_sin_y)
    pausar()

    grafos = fase_7_grafo_ponderado(matrices)
    pausar()

    arboles = fase_8_arboles_expansion(grafos)
    pausar()

    fase_9_comparacion_final(arboles)
    pausar("Presione Enter para ver el resumen final...")

    resumen_final()


if __name__ == "__main__":
    main()
