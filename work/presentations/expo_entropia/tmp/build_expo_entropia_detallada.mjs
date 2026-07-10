import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "D:/Ing. de Sistemas/7_semestre/LenguajesProgramacion/FinalPython";
const OUT = path.join(ROOT, "outputs", "exposicion_entropia_detallada.pptx");
const PREVIEW_DIR = path.join(ROOT, "work", "presentations", "expo_entropia", "tmp", "preview_detallada");
const W = 1280;
const H = 720;
const TOTAL = 22;

const c = {
  ink: "#182033",
  muted: "#5E6678",
  pale: "#F5F7FB",
  line: "#D7DEE9",
  blue: "#2563EB",
  teal: "#0E7490",
  green: "#16A34A",
  orange: "#EA580C",
  red: "#DC2626",
  white: "#FFFFFF",
  dark: "#111827",
};

async function readBlob(file) {
  const bytes = await fs.readFile(path.join(ROOT, file));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function writeBlob(file, blob) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(await blob.arrayBuffer()));
}

function text(slide, value, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    fontSize: opts.size ?? 22,
    bold: opts.bold ?? false,
    color: opts.color ?? c.ink,
    alignment: opts.align ?? "left",
    typeface: opts.face ?? "Aptos",
  };
  return shape;
}

function rect(slide, x, y, w, h, fill, line = "none") {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: line === "none" ? 0 : 1 },
  });
}

function header(slide, n, title, section = "") {
  text(slide, section, 64, 34, 620, 24, { size: 14, bold: true, color: c.blue });
  text(slide, title, 64, 66, 900, 82, { size: 35, bold: true, color: c.ink });
  rect(slide, 64, 152, 92, 5, c.teal);
  text(slide, "Analisis de dependencia entre variables discretas", 64, 666, 520, 24, {
    size: 13,
    color: c.muted,
  });
  text(slide, `${String(n).padStart(2, "0")}/${TOTAL}`, 1136, 660, 80, 30, {
    size: 17,
    bold: true,
    color: c.ink,
    align: "right",
  });
}

function bullet(slide, value, x, y, w = 500, color = c.blue, size = 21) {
  rect(slide, x, y + 10, 9, 9, color);
  text(slide, value, x + 24, y, w, 48, { size, color: c.ink });
}

function metric(slide, label, value, x, y, color = c.blue, width = 170) {
  text(slide, value, x, y, width, 42, { size: 31, bold: true, color, align: "center" });
  text(slide, label, x, y + 42, width, 38, { size: 15, color: c.muted, align: "center" });
}

async function image(slide, file, x, y, w, h, alt, fit = "contain") {
  slide.images.add({
    blob: await readBlob(file),
    contentType: "image/png",
    alt,
    fit,
    position: { left: x, top: y, width: w, height: h },
  });
}

function simpleTable(slide, rows, x, y, colWidths, rowH, opts = {}) {
  const headerFill = opts.headerFill ?? c.ink;
  const textSize = opts.size ?? 17;
  let yy = y;
  rows.forEach((row, r) => {
    let xx = x;
    row.forEach((cell, col) => {
      const isHeader = r === 0;
      rect(slide, xx, yy, colWidths[col], rowH, isHeader ? headerFill : c.white, c.line);
      text(slide, String(cell), xx + 8, yy + 8, colWidths[col] - 16, rowH - 12, {
        size: isHeader ? textSize : textSize - 1,
        bold: isHeader,
        color: isHeader ? c.white : c.ink,
        align: opts.align?.[col] ?? "left",
      });
      xx += colWidths[col];
    });
    yy += rowH;
  });
}

function note(slide, lines) {
  slide.speakerNotes.textFrame.setText(lines);
}

async function main() {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  let s = deck.slides.add();
  s.background.fill = c.pale;
  await image(s, "graficos/comparacion_arboles_best_worst.png", 694, 82, 500, 410, "Comparacion de arboles BEST y WORST");
  text(s, "Analisis de dependencia entre variables discretas", 64, 94, 580, 122, { size: 50, bold: true });
  text(s, "Informacion mutua, entropia de Shannon y arboles de maxima dependencia con Prim y Kruskal.", 68, 244, 560, 88, { size: 25, color: c.muted });
  rect(s, 68, 365, 128, 5, c.teal);
  metric(s, "registros", "1000", 72, 420, c.blue);
  metric(s, "variables originales", "9", 250, 420, c.teal);
  metric(s, "grupos analizados", "2", 428, 420, c.green);
  text(s, "01/22", 1134, 660, 84, 30, { size: 17, bold: true, align: "right" });
  note(s, ["Abrir explicando que la tarea transforma un dataset discreto en una estructura visual de dependencias.", "La exposicion no busca entrenar un modelo, sino interpretar relaciones entre variables."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 2, "La tarea consiste en resumir dependencias dentro de un dataset discreto", "PROBLEMA");
  bullet(s, "Se parte de un archivo con 1000 observaciones y 9 variables categoricas.", 92, 206, 780, c.blue);
  bullet(s, "El objetivo es comparar la estructura interna de dependencia entre dos clases: BEST y WORST.", 92, 274, 850, c.teal);
  bullet(s, "Cada variable se interpreta como un nodo y cada relacion se mide con informacion mutua.", 92, 342, 850, c.green);
  bullet(s, "El resultado se sintetiza en arboles de maxima dependencia para evitar una lectura saturada del grafo completo.", 92, 410, 880, c.orange);
  text(s, "Idea central", 930, 214, 220, 34, { size: 25, bold: true, color: c.blue, align: "center" });
  text(s, "Pasar de muchas combinaciones de variables a una explicacion visual clara.", 882, 270, 320, 118, { size: 24, bold: true, align: "center" });
  note(s, ["Esta diapositiva debe dejar claro el sentido de la tarea: medir y comparar relaciones.", "Recalcar que la informacion mutua permite capturar dependencia sin suponer linealidad."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 3, "El dataset se separa en dos clases usando Y = x7 = x8", "DATOS");
  simpleTable(s, [
    ["Caracteristica", "Valor"],
    ["Registros totales", "1000"],
    ["Variables originales", "9"],
    ["Valores faltantes", "0"],
    ["Tipo de variables", "Discretas / categoricas"],
    ["BEST", "502 registros"],
    ["WORST", "498 registros"],
  ], 90, 196, [380, 270], 48, { size: 18 });
  text(s, "La validacion encontro que x7 y x8 coinciden en todos los registros. Por eso se define Y como variable objetivo.", 760, 218, 360, 120, { size: 23, color: c.ink });
  text(s, "Y = 1 -> BEST\nY = 0 -> WORST", 796, 380, 310, 90, { size: 30, bold: true, color: c.teal, align: "center" });
  text(s, "La particion queda balanceada, lo que permite comparar ambos grupos sin una diferencia fuerte de tamano.", 746, 520, 390, 70, { size: 21, color: c.muted });
  note(s, ["Explicar que x7 y x8 se usan para formar Y porque son iguales en todos los registros.", "Luego Y se retira de cada subconjunto porque dentro de cada clase es constante."]);

  s = deck.slides.add();
  s.background.fill = c.pale;
  header(s, 4, "Las variables tienen dominios pequenos, por eso el enfoque discreto encaja con la tarea", "CARACTERIZACION");
  simpleTable(s, [
    ["Variable", "Dominio", "Categorias"],
    ["x1", "{0,1}", "2"],
    ["x2", "{0,1}", "2"],
    ["x5", "{0,1,2}", "3"],
    ["x4", "{0,1}", "2"],
    ["x6", "{0,1}", "2"],
    ["x9", "{0,1,2,3}", "4"],
    ["x3", "{0,1,2}", "3"],
  ], 110, 190, [160, 280, 160], 43, { size: 17, align: ["left", "center", "center"] });
  text(s, "Despues de crear Y, el analisis interno se hace con siete variables: x1, x2, x5, x4, x6, x9 y x3.", 760, 224, 360, 100, { size: 24, bold: true });
  text(s, "Como las variables son discretas, las probabilidades se obtienen por frecuencias observadas.", 760, 374, 360, 88, { size: 22, color: c.muted });
  note(s, ["Mostrar que el dataset es apropiado para entropia e informacion mutua porque todo se maneja con categorias.", "x9 destaca por tener cuatro categorias, mas que las demas variables."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 5, "El proyecto se organizo por fases para que el analisis sea reproducible", "IMPLEMENTACION");
  simpleTable(s, [
    ["Archivo", "Responsabilidad principal"],
    ["main.py", "Coordina las fases del proceso."],
    ["fases_dataset.py", "Carga datos, valida x7/x8, crea Y y separa grupos."],
    ["fases_informacion.py", "Calcula entropias y matrices de informacion mutua."],
    ["fases_grafos.py", "Construye grafos, arboles y comparaciones finales."],
    ["formulas.py", "Contiene Shannon, informacion mutua, Prim, Kruskal y caminos."],
    ["graficos.py", "Genera barras, heatmaps, grafos y arboles en PNG."],
  ], 72, 186, [250, 830], 53, { size: 16 });
  note(s, ["Esta diapositiva muestra que no solo se calcularon resultados, tambien se estructuro el codigo.", "El flujo modular ayuda a defender la tarea como trabajo reproducible."]);

  s = deck.slides.add();
  s.background.fill = c.pale;
  header(s, 6, "El flujo completo transforma el dataset en resultados interpretables", "METODOLOGIA");
  const flow = [
    ["1", "Cargar y revisar el dataset original"],
    ["2", "Validar x7 y x8 para construir Y"],
    ["3", "Separar registros en BEST y WORST"],
    ["4", "Retirar Y de cada subconjunto"],
    ["5", "Calcular entropias individuales"],
    ["6", "Calcular matrices de informacion mutua"],
    ["7", "Construir grafos ponderados completos"],
    ["8", "Obtener arboles de maxima dependencia"],
    ["9", "Comparar caminos y conclusiones"],
  ];
  flow.forEach(([n, label], i) => {
    const col = i < 5 ? 0 : 1;
    const row = col === 0 ? i : i - 5;
    const x = col === 0 ? 120 : 690;
    const y = 190 + row * 76;
    text(s, n, x, y, 42, 42, { size: 29, bold: true, color: col === 0 ? c.blue : c.teal, align: "center" });
    text(s, label, x + 58, y + 2, 410, 44, { size: 22 });
  });
  note(s, ["Recorrer las fases de forma secuencial.", "La narrativa debe ser: datos, preparacion, calculo, grafo, arbol y comparacion."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 7, "La entropia mide cuanta incertidumbre tiene cada variable", "BASE TEORICA");
  text(s, "H(X) = - sum p(x) log2 p(x)", 94, 214, 540, 58, { size: 31, bold: true, color: c.blue });
  bullet(s, "Si una variable casi siempre toma el mismo valor, su entropia es baja.", 100, 318, 560, c.blue);
  bullet(s, "Si reparte sus valores entre varias categorias, su entropia aumenta.", 100, 386, 560, c.teal);
  bullet(s, "La entropia no compara dos variables; solo describe variabilidad individual.", 100, 454, 600, c.orange);
  text(s, "Ejemplo de lectura", 810, 230, 260, 36, { size: 27, bold: true, color: c.ink, align: "center" });
  text(s, "x9 tiene mas categorias observadas y alcanza la mayor entropia en ambos grupos.", 754, 292, 370, 126, { size: 25, bold: true, align: "center" });
  note(s, ["Explicar la formula en palabras, no hacer una demostracion matematica extensa.", "La entropia responde: que tan variable es una sola columna."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 8, "La informacion mutua mide dependencia entre pares de variables", "BASE TEORICA");
  text(s, "I(X;Y) = sum p(x,y) log2 [ p(x,y) / (p(x)p(y)) ]", 82, 204, 660, 68, { size: 27, bold: true, color: c.teal });
  bullet(s, "I(X;Y) = 0 indica independencia aproximada entre las variables.", 92, 326, 690, c.blue);
  bullet(s, "Un valor mayor significa que conocer una variable ayuda a reducir la incertidumbre de la otra.", 92, 394, 760, c.teal);
  bullet(s, "La matriz es simetrica y su diagonal coincide con H(X).", 92, 462, 680, c.green);
  text(s, "Uso en la tarea", 892, 236, 260, 36, { size: 27, bold: true, color: c.ink, align: "center" });
  text(s, "Cada peso del grafo es informacion mutua entre dos variables.", 840, 298, 360, 100, { size: 25, bold: true, align: "center" });
  note(s, ["Conectar la formula con el grafo: cada arista lleva un peso I(X;Y).", "La diagonal no se usa como arista porque relaciona una variable consigo misma."]);

  s = deck.slides.add();
  s.background.fill = c.pale;
  header(s, 9, "El grafo completo muestra todas las relaciones, pero el arbol conserva las mas importantes", "GRAFOS");
  text(s, "Grafo ponderado", 96, 210, 330, 38, { size: 28, bold: true, color: c.blue });
  bullet(s, "Nodo: variable del dataset.", 100, 276, 420, c.blue);
  bullet(s, "Arista: relacion entre dos variables.", 100, 334, 460, c.teal);
  bullet(s, "Peso: informacion mutua del par.", 100, 392, 430, c.green);
  text(s, "Arbol de maxima dependencia", 700, 210, 410, 38, { size: 28, bold: true, color: c.teal });
  bullet(s, "Conecta todas las variables sin ciclos.", 704, 276, 430, c.blue);
  bullet(s, "Prioriza las aristas con mayor peso.", 704, 334, 430, c.teal);
  bullet(s, "Resume la estructura principal del grupo.", 704, 392, 450, c.green);
  text(s, "W(T) = sum I(u;v)", 450, 540, 380, 44, { size: 30, bold: true, color: c.orange, align: "center" });
  note(s, ["La razon de usar arbol es simplificar: el grafo completo puede tener demasiadas aristas.", "El arbol mantiene conectividad y evita ciclos."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 10, "Prim y Kruskal son dos formas de llegar al arbol de maxima dependencia", "ALGORITMOS");
  simpleTable(s, [
    ["Algoritmo", "Criterio usado", "Resultado esperado"],
    ["Kruskal", "Ordena aristas de mayor a menor y evita ciclos.", "Arbol con las mejores aristas globales."],
    ["Prim", "Crece desde un nodo y agrega la mejor conexion disponible.", "Arbol conectado con peso maximo."],
  ], 90, 214, [170, 520, 400], 88, { size: 17 });
  text(s, "En esta tarea ambos algoritmos llegan al mismo peso total dentro de cada grupo, lo que valida la consistencia del resultado.", 190, 500, 900, 76, { size: 25, bold: true, align: "center" });
  note(s, ["Comparar Prim y Kruskal en lenguaje simple.", "No hace falta entrar en complejidad computacional; lo importante es que ambos coinciden en el peso total."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 11, "x9 es la variable con mayor entropia en BEST y WORST", "RESULTADOS DE ENTROPIA");
  await image(s, "graficos/comparacion_entropias_best_worst.png", 76, 184, 700, 410, "Comparacion de entropias BEST y WORST");
  simpleTable(s, [
    ["Variable", "BEST", "WORST"],
    ["x9", "1.744762", "1.685441"],
    ["x5", "1.411587", "1.416200"],
    ["x2", "0.999072", "0.998592"],
    ["x6", "0.997422", "0.999814"],
  ], 820, 220, [120, 130, 130], 48, { size: 16, align: ["left", "center", "center"] });
  text(s, "Lectura: x9 conserva alta variabilidad en ambos grupos; x5, x2 y x6 tambien muestran valores altos.", 802, 458, 410, 92, { size: 21, color: c.ink });
  note(s, ["x9 lidera la entropia en ambos casos.", "Aclarar que esta lamina no decide dependencia entre variables; solo mide variabilidad individual."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 12, "El grupo BEST tiene relaciones fuertes alrededor de x9 y x5", "BEST");
  await image(s, "graficos/heatmap_IM_best.png", 70, 178, 515, 390, "Heatmap de informacion mutua BEST");
  simpleTable(s, [
    ["Relacion", "IM"],
    ["x6 - x9", "0.997422"],
    ["x4 - x9", "0.747456"],
    ["x2 - x5", "0.655467"],
    ["x1 - x5", "0.414958"],
    ["x5 - x9", "0.016187"],
  ], 720, 206, [190, 150], 48, { size: 17, align: ["left", "center"] });
  text(s, "La matriz muestra que no todas las relaciones pesan igual. Las conexiones dominantes son las que despues aparecen en el arbol.", 680, 490, 460, 78, { size: 22 });
  note(s, ["Explicar que los colores mas intensos del heatmap corresponden a mayor informacion mutua.", "En BEST, x6-x9 y x4-x9 son conexiones muy fuertes."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 13, "El grafo completo BEST confirma que hay muchas aristas, pero pocas dominan", "BEST");
  await image(s, "graficos/grafo_ponderado_best.png", 80, 174, 640, 430, "Grafo ponderado completo BEST");
  bullet(s, "El grafo completo conecta todas las variables entre si.", 780, 226, 380, c.blue);
  bullet(s, "Las aristas con mayor informacion mutua concentran la interpretacion.", 780, 306, 390, c.teal);
  bullet(s, "El arbol elimina conexiones debiles para dejar una estructura clara.", 780, 386, 390, c.green);
  note(s, ["Mostrar que el grafo completo es util para calcular, pero no siempre para exponer.", "Por eso se pasa al arbol de maxima dependencia."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 14, "El arbol BEST resume seis conexiones y un peso total de 2.833722", "BEST");
  await image(s, "graficos/arbol_kruskal_best.png", 80, 184, 520, 390, "Arbol Kruskal BEST");
  simpleTable(s, [
    ["Arista", "Peso"],
    ["x6 - x9", "0.997422"],
    ["x4 - x9", "0.747456"],
    ["x2 - x5", "0.655467"],
    ["x1 - x5", "0.414958"],
    ["x5 - x9", "0.016187"],
    ["x1 - x3", "0.002232"],
  ], 704, 190, [180, 140], 46, { size: 16, align: ["left", "center"] });
  text(s, "Peso total BEST: 2.833722", 704, 520, 380, 40, { size: 26, bold: true, color: c.green });
  note(s, ["Este arbol conecta las siete variables internas con seis aristas.", "x3 entra por x1-x3, una conexion debil pero necesaria para completar el arbol."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 15, "El grupo WORST conserva el nucleo, pero cambia algunos pesos", "WORST");
  await image(s, "graficos/heatmap_IM_worst.png", 70, 178, 515, 390, "Heatmap de informacion mutua WORST");
  simpleTable(s, [
    ["Relacion", "IM"],
    ["x6 - x9", "0.999814"],
    ["x2 - x5", "0.686923"],
    ["x4 - x9", "0.686015"],
    ["x1 - x5", "0.423706"],
    ["x9 - x3", "0.005813"],
  ], 720, 206, [190, 150], 48, { size: 17, align: ["left", "center"] });
  text(s, "La relacion x2-x5 aumenta respecto a BEST, mientras x4-x9 disminuye.", 688, 490, 450, 70, { size: 23, bold: true });
  note(s, ["WORST mantiene como dominante la relacion x6-x9.", "La comparacion importante es que x2-x5 gana peso y x4-x9 baja."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 16, "El grafo completo WORST muestra una estructura parecida con ajustes en la fuerza", "WORST");
  await image(s, "graficos/grafo_ponderado_worst.png", 80, 174, 640, 430, "Grafo ponderado completo WORST");
  bullet(s, "La estructura central sigue pasando por x9 y x5.", 780, 226, 380, c.blue);
  bullet(s, "La diferencia no esta en que aparezca otro nucleo, sino en como cambian los pesos.", 780, 306, 410, c.teal);
  bullet(s, "Por eso se necesita comparar arboles y caminos, no solo mirar un heatmap.", 780, 406, 410, c.orange);
  note(s, ["Conectar esta diapositiva con el siguiente arbol.", "La lectura principal es estabilidad estructural con diferencias especificas."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 17, "El arbol WORST tiene peso total de 2.809188 y conecta x3 por x9", "WORST");
  await image(s, "graficos/arbol_kruskal_worst.png", 80, 184, 520, 390, "Arbol Kruskal WORST");
  simpleTable(s, [
    ["Arista", "Peso"],
    ["x6 - x9", "0.999814"],
    ["x2 - x5", "0.686923"],
    ["x4 - x9", "0.686015"],
    ["x1 - x5", "0.423706"],
    ["x5 - x9", "0.006917"],
    ["x9 - x3", "0.005813"],
  ], 704, 190, [180, 140], 46, { size: 16, align: ["left", "center"] });
  text(s, "Peso total WORST: 2.809188", 704, 520, 390, 40, { size: 26, bold: true, color: c.orange });
  note(s, ["Subrayar que x3 ahora se conecta por x9-x3, no por x1-x3.", "Ese cambio sera clave en la comparacion final."]);

  s = deck.slides.add();
  s.background.fill = c.pale;
  header(s, 18, "La comparacion directa muestra una estructura central muy similar", "COMPARACION");
  await image(s, "graficos/comparacion_arboles_best_worst.png", 96, 180, 650, 408, "Comparacion de arboles BEST y WORST");
  metric(s, "peso total BEST", "2.833722", 820, 226, c.green, 230);
  metric(s, "peso total WORST", "2.809188", 820, 348, c.orange, 230);
  text(s, "Diferencia de peso total: 0.024534", 790, 492, 320, 44, { size: 25, bold: true, color: c.ink, align: "center" });
  note(s, ["El peso total es ligeramente mayor en BEST.", "La diferencia total es pequena; la interpretacion fina viene de las conexiones y caminos."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 19, "La matriz de caminos evalua como se conectan indirectamente las variables", "COMPARACION");
  text(s, "C(xi,xj) = sumatoria de pesos en el unico camino del arbol", 94, 210, 700, 50, { size: 27, bold: true, color: c.blue });
  bullet(s, "En un arbol existe un unico camino entre dos variables.", 100, 314, 760, c.blue);
  bullet(s, "Para cada par se suman las informaciones mutuas de las aristas recorridas.", 100, 380, 860, c.teal);
  bullet(s, "Luego se suman los caminos por variable para comparar BEST y WORST.", 100, 446, 820, c.green);
  text(s, "Esta comparacion detecta cambios estructurales que no se ven solo con el peso total del arbol.", 230, 560, 820, 58, { size: 25, bold: true, align: "center" });
  note(s, ["Explicar con palabras: la matriz de caminos mide la ubicacion de cada variable dentro del arbol.", "Si una variable cambia de conexion, sus caminos acumulados cambian bastante."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 20, "x3 es la variable que mas cambia entre BEST y WORST", "COMPARACION");
  simpleTable(s, [
    ["Variable", "Suma BEST", "Suma WORST", "Dif. abs."],
    ["x3", "4.537088", "2.852084", "1.685004"],
    ["x4", "7.034521", "6.253096", "0.781426"],
    ["x9", "3.297242", "2.823021", "0.474221"],
    ["x6", "8.284353", "7.822090", "0.462263"],
    ["x5", "3.281054", "2.829937", "0.451117"],
    ["x1", "4.525929", "4.948468", "0.422538"],
    ["x2", "6.558388", "6.264555", "0.293833"],
  ], 82, 190, [140, 190, 190, 170], 46, { size: 16, align: ["left", "center", "center", "center"] });
  text(s, "La diferencia mas grande aparece en x3 porque cambia su conexion: en BEST entra por x1-x3 y en WORST por x9-x3.", 812, 266, 360, 150, { size: 24, bold: true });
  text(s, "Esta es la evidencia mas clara de cambio estructural entre grupos.", 812, 464, 360, 72, { size: 22, color: c.muted });
  note(s, ["Presentar x3 como el hallazgo principal de la comparacion.", "Aunque sus aristas tienen pesos pequenos, su posicion dentro del arbol cambia los caminos acumulados."]);

  s = deck.slides.add();
  s.background.fill = c.white;
  header(s, 21, "Los resultados indican estabilidad general y cambios puntuales", "INTERPRETACION");
  bullet(s, "En ambos grupos, x6-x9 es la relacion mas fuerte.", 96, 202, 860, c.blue, 23);
  bullet(s, "x9 mantiene la mayor entropia, por lo que es la variable con mayor diversidad de valores.", 96, 276, 900, c.teal, 23);
  bullet(s, "x2-x5 es mas fuerte en WORST que en BEST.", 96, 350, 860, c.green, 23);
  bullet(s, "x4-x9 es mas fuerte en BEST que en WORST.", 96, 424, 860, c.orange, 23);
  bullet(s, "Prim y Kruskal coinciden en el peso total dentro de cada grupo.", 96, 498, 860, c.red, 23);
  note(s, ["Esta diapositiva traduce resultados a significado.", "Evitar listar solo numeros; explicar que hay un nucleo estable con diferencias concretas."]);

  s = deck.slides.add();
  s.background.fill = c.dark;
  text(s, "Conclusion", 70, 62, 320, 42, { size: 29, bold: true, color: "#67E8F9" });
  text(s, "La tarea demuestra que la informacion mutua permite convertir datos discretos en una explicacion visual de dependencias.", 70, 124, 980, 110, { size: 43, bold: true, color: c.white });
  text(s, "Hallazgos finales", 74, 310, 300, 34, { size: 28, bold: true, color: "#93C5FD" });
  text(s, "1. La clase Y se construyo correctamente porque x7 y x8 coinciden en los 1000 registros.\n2. BEST y WORST quedan balanceados: 502 y 498 registros.\n3. x9 es la variable con mayor entropia en ambos grupos.\n4. x6-x9 es la relacion mas fuerte en ambos arboles.\n5. x3 es el cambio estructural mas claro entre grupos.", 74, 366, 880, 178, { size: 23, color: c.white });
  text(s, "22/22", 1110, 642, 86, 34, { size: 20, bold: true, color: c.white, align: "right" });
  note(s, ["Cerrar con la idea de transferencia: de dataset a grafo, de grafo a arbol, de arbol a interpretacion.", "La exposicion debe terminar afirmando que la estructura principal se conserva, pero x3 cambia su forma de conectarse."]);

  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(path.join(PREVIEW_DIR, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(PREVIEW_DIR, `${stem}.layout.json`), await layout.text(), "utf8");
  }
  await writeBlob(path.join(PREVIEW_DIR, "montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(OUT);
  console.log(OUT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
