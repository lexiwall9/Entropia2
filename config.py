from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
ARCHIVO_ENTRADA = BASE_DIR / "d9_strong.csv"

DIR_SALIDAS = BASE_DIR / "salidas"
DIR_DATASETS = DIR_SALIDAS / "datasets"
DIR_TABLAS = DIR_SALIDAS / "tablas"
DIR_GRAFICOS = BASE_DIR / "graficos"

COLUMNAS_ESPERADAS = ["x1", "x2", "x5", "x4", "x6", "x9", "x3", "x7", "x8"]
COLUMNAS_ANALISIS = ["x1", "x2", "x5", "x4", "x6", "x9", "x3"]
