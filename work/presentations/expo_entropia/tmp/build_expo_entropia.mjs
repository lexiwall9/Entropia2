import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "D:/Ing. de Sistemas/7_semestre/LenguajesProgramacion/FinalPython";
const OUT = path.join(ROOT, "outputs", "exposicion_entropia_informacion_mutua.pptx");
const PREVIEW_DIR = path.join(ROOT, "work", "presentations", "expo_entropia", "tmp", "preview");
const W = 1280;
const H = 720;
const TOTAL = 10;

const colors = {
  ink: "#172033",
  muted: "#5C6474",
  soft: "#F5F7FB",
  line: "#D8DEE9",
  blue: "#2563EB",
  teal: "#0891B2",
  green: "#16A34A",
  orange: "#EA580C",
  red: "#DC2626",
  white: "#FFFFFF",
};

async function bytes(file) {
  const data = await fs.readFile(path.join(ROOT, file));
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

async function writeBlob(file, blob) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(await blob.arrayBuffer()));
}

function addText(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontSize: opts.size ?? 24,
    bold: opts.bold ?? false,
    color: opts.color ?? colors.ink,
    alignment: opts.align ?? "left",
    typeface: opts.face ?? "Aptos",
  };
  return shape;
}

function addBand(slide, x, y, w, h, fill, line = "none") {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: line === "none" ? 0 : 1 },
  });
}

function addRule(slide, x, y, w, color = colors.blue) {
  addBand(slide, x, y, w, 5, color);
}

function footer(slide, n) {
  addText(slide, "Analisis de dependencia con informacion mutua", 64, 666, 520, 24, {
    size: 14,
    color: colors.muted,
  });
  addText(slide, `${String(n).padStart(2, "0")}/${TOTAL}`, 1146, 660, 70, 32, {
    size: 18,
    bold: true,
    color: colors.ink,
    align: "right",
  });
}

function title(slide, n, heading, kicker = "") {
  addText(slide, kicker || "EXPOSICION", 64, 38, 560, 26, {
    size: 15,
    bold: true,
    color: colors.blue,
  });
  addText(slide, heading, 64, 74, 850, 58, {
    size: 36,
    bold: true,
    color: colors.ink,
  });
  addRule(slide, 64, 138, 96);
  footer(slide, n);
}

async function addImage(slide, file, x, y, w, h, alt, fit = "contain") {
  slide.images.add({
    blob: await bytes(file),
    contentType: "image/png",
    alt,
    fit,
    position: { left: x, top: y, width: w, height: h },
  });
}

function metric(slide, label, value, x, y, color) {
  addText(slide, value, x, y, 150, 44, { size: 31, bold: true, color });
  addText(slide, label, x, y + 44, 170, 36, { size: 16, color: colors.muted });
}

function bullet(slide, text, x, y, color = colors.blue) {
  addBand(slide, x, y + 9, 9, 9, color);
  addText(slide, text, x + 22, y, 520, 36, { size: 22, color: colors.ink });
}

async function main() {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });

  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.soft;
    addBand(slide, 0, 0, W, H, colors.soft);
    await addImage(slide, "graficos/comparacion_arboles_best_worst.png", 690, 80, 500, 430, "Comparacion de arboles BEST y WORST");
    addText(slide, "Analisis de dependencia entre variables discretas", 64, 94, 570, 126, {
      size: 48,
      bold: true,
      color: colors.ink,
    });
    addText(slide, "Entropia de Shannon, informacion mutua y arboles de maxima dependencia con Prim y Kruskal.", 68, 244, 540, 92, {
      size: 25,
      color: colors.muted,
    });
    addRule(slide, 68, 370, 128, colors.teal);
    metric(slide, "registros", "1000", 70, 416, colors.blue);
    metric(slide, "variables originales", "9", 250, 416, colors.teal);
    metric(slide, "grupos comparados", "2", 430, 416, colors.green);
    footer(slide, 1);
    slide.speakerNotes.textFrame.setText([
      "Presentar la idea central: no se busca predecir, sino entender como se relacionan las variables.",
      "Explicar que la informacion mutua se usa como peso para construir grafos y arboles.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.white;
    title(slide, 2, "Comparamos como cambia la dependencia entre BEST y WORST", "PUNTO DE PARTIDA");
    bullet(slide, "El dataset tiene variables discretas y no se asume una relacion lineal.", 90, 210, colors.blue);
    bullet(slide, "x7 y x8 coinciden en todos los registros, por eso definen la clase Y.", 90, 275, colors.teal);
    bullet(slide, "Se separan los registros en BEST y WORST para comparar estructuras internas.", 90, 340, colors.green);
    bullet(slide, "La respuesta se resume en grafos y arboles de maxima dependencia.", 90, 405, colors.orange);
    metric(slide, "BEST", "502", 820, 238, colors.green);
    metric(slide, "WORST", "498", 1000, 238, colors.orange);
    addText(slide, "Y = x7 = x8", 826, 382, 300, 50, { size: 38, bold: true, color: colors.ink, align: "center" });
    addText(slide, "La particion queda practicamente balanceada.", 804, 448, 360, 54, { size: 20, color: colors.muted, align: "center" });
    slide.speakerNotes.textFrame.setText([
      "Primero se valida el dato: x7 y x8 son iguales en los 1000 registros.",
      "Eso permite definir Y y separar dos grupos casi del mismo tamano.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.white;
    title(slide, 3, "El flujo convierte datos discretos en una estructura facil de comparar", "METODO");
    const steps = [
      ["1", "Validar x7 y x8"],
      ["2", "Crear Y y separar BEST/WORST"],
      ["3", "Retirar Y de cada grupo"],
      ["4", "Calcular entropia e informacion mutua"],
      ["5", "Construir grafos completos"],
      ["6", "Extraer arboles con Prim y Kruskal"],
    ];
    let x = 78;
    let y = 222;
    for (const [num, label] of steps) {
      addText(slide, num, x, y, 48, 44, { size: 30, bold: true, color: colors.blue, align: "center" });
      addText(slide, label, x + 62, y + 4, 270, 42, { size: 22, color: colors.ink });
      y += 72;
      if (y > 470) {
        y = 222;
        x = 670;
      }
    }
    addText(slide, "La salida final no es una tabla larga: es un arbol que conserva las relaciones mas importantes sin ciclos.", 150, 560, 980, 52, {
      size: 24,
      color: colors.muted,
      align: "center",
    });
    slide.speakerNotes.textFrame.setText([
      "Recorrer el flujo en orden y remarcar que cada fase reduce complejidad.",
      "El arbol permite explicar dependencias sin mostrar todas las 21 relaciones posibles entre las siete variables internas.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.soft;
    title(slide, 4, "Dos formulas bastan para entender todo el analisis", "BASE TEORICA");
    addText(slide, "Entropia", 92, 202, 420, 40, { size: 30, bold: true, color: colors.blue });
    addText(slide, "H(X) = - sum p(x) log2 p(x)", 92, 264, 470, 44, { size: 27, bold: true, color: colors.ink });
    addText(slide, "Mide incertidumbre: si una variable reparte sus valores, su entropia sube.", 92, 330, 470, 82, { size: 22, color: colors.muted });
    addText(slide, "Informacion mutua", 704, 202, 420, 40, { size: 30, bold: true, color: colors.teal });
    addText(slide, "I(X;Y) = sum p(x,y) log2[p(x,y)/(p(x)p(y))]", 704, 264, 470, 72, { size: 23, bold: true, color: colors.ink });
    addText(slide, "Mide dependencia: mientras mayor sea el valor, mas informacion comparten dos variables.", 704, 356, 460, 82, { size: 22, color: colors.muted });
    addText(slide, "En el grafo, cada variable es un nodo y cada arista pesa I(X;Y).", 184, 540, 920, 50, {
      size: 26,
      bold: true,
      color: colors.ink,
      align: "center",
    });
    slide.speakerNotes.textFrame.setText([
      "No entrar en derivaciones largas. La entropia habla de variabilidad y la informacion mutua habla de dependencia.",
      "La clave para el publico: los pesos grandes son relaciones fuertes.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.white;
    title(slide, 5, "x9 es la variable mas variable en ambos grupos", "RESULTADO 1");
    await addImage(slide, "graficos/comparacion_entropias_best_worst.png", 112, 172, 712, 410, "Comparacion de entropias BEST y WORST");
    addText(slide, "Lectura rapida", 890, 188, 270, 36, { size: 28, bold: true, color: colors.ink });
    bullet(slide, "x9 tiene la mayor entropia en BEST y WORST.", 890, 252, colors.blue);
    bullet(slide, "x5 tambien conserva alta variabilidad.", 890, 326, colors.teal);
    bullet(slide, "La entropia sola no dice dependencia; solo resume diversidad.", 890, 400, colors.orange);
    slide.speakerNotes.textFrame.setText([
      "Usar esta lamina para separar dos ideas: una variable puede ser muy variable, pero eso no significa que explique a otra.",
      "Despues de mirar entropia, pasamos a informacion mutua para ver relaciones.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.white;
    title(slide, 6, "BEST concentra sus relaciones fuertes alrededor de x9 y x5", "RESULTADO 2");
    await addImage(slide, "graficos/heatmap_IM_best.png", 74, 176, 514, 392, "Mapa de calor de informacion mutua BEST");
    await addImage(slide, "graficos/arbol_kruskal_best.png", 674, 170, 500, 392, "Arbol de maxima dependencia BEST");
    addText(slide, "Aristas clave: x6-x9, x4-x9, x2-x5 y x1-x5.", 150, 594, 980, 38, {
      size: 25,
      bold: true,
      color: colors.ink,
      align: "center",
    });
    slide.speakerNotes.textFrame.setText([
      "En el mapa de calor, los colores mas fuertes indican mayor informacion mutua.",
      "En BEST, x6-x9 es la relacion dominante y el arbol conecta tambien x4 con x9 y x2/x1 con x5.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.white;
    title(slide, 7, "WORST mantiene el nucleo, pero cambia la fuerza de algunas conexiones", "RESULTADO 3");
    await addImage(slide, "graficos/heatmap_IM_worst.png", 74, 176, 514, 392, "Mapa de calor de informacion mutua WORST");
    await addImage(slide, "graficos/arbol_kruskal_worst.png", 674, 170, 500, 392, "Arbol de maxima dependencia WORST");
    addText(slide, "x2-x5 sube en WORST; x4-x9 baja respecto a BEST.", 150, 594, 980, 38, {
      size: 25,
      bold: true,
      color: colors.ink,
      align: "center",
    });
    slide.speakerNotes.textFrame.setText([
      "WORST no rompe la estructura general, pero mueve algunos pesos.",
      "La relacion x2-x5 gana importancia y x4-x9 pierde fuerza frente a BEST.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.soft;
    title(slide, 8, "Prim y Kruskal llegan al mismo peso total por grupo", "VALIDACION");
    await addImage(slide, "graficos/comparacion_arboles_best_worst.png", 90, 172, 620, 392, "Comparacion visual de arboles BEST y WORST");
    metric(slide, "peso total BEST", "2.833722", 812, 216, colors.green);
    metric(slide, "peso total WORST", "2.809188", 812, 330, colors.orange);
    addText(slide, "La diferencia existe, pero no cambia la conclusion: ambos grupos comparten una estructura central parecida.", 806, 462, 350, 94, {
      size: 23,
      color: colors.ink,
    });
    slide.speakerNotes.textFrame.setText([
      "Aclarar que Prim y Kruskal son dos caminos para obtener el arbol de maxima dependencia.",
      "Como llegan al mismo peso, la comparacion es consistente y no depende del algoritmo elegido.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.white;
    title(slide, 9, "La diferencia mas clara esta en como se conecta x3", "COMPARACION FINAL");
    addText(slide, "Variable con mayor cambio", 96, 204, 440, 36, { size: 28, bold: true, color: colors.ink });
    addText(slide, "x3", 96, 254, 180, 76, { size: 64, bold: true, color: colors.blue });
    addText(slide, "Diferencia absoluta: 1.685004 en la suma de caminos.", 96, 352, 520, 62, { size: 25, color: colors.muted });
    addText(slide, "BEST", 700, 210, 180, 34, { size: 25, bold: true, color: colors.green });
    addText(slide, "x3 se conecta mediante x1-x3", 700, 255, 380, 42, { size: 26, color: colors.ink });
    addText(slide, "WORST", 700, 358, 180, 34, { size: 25, bold: true, color: colors.orange });
    addText(slide, "x3 se conecta mediante x9-x3", 700, 403, 380, 42, { size: 26, color: colors.ink });
    addText(slide, "Aunque son pesos pequenos, cambian la forma final del arbol.", 238, 560, 810, 44, {
      size: 25,
      bold: true,
      color: colors.ink,
      align: "center",
    });
    slide.speakerNotes.textFrame.setText([
      "Esta es la parte interpretativa mas importante.",
      "La estructura principal es similar, pero x3 cambia de ruta segun la clase: por x1 en BEST y por x9 en WORST.",
    ]);
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = colors.ink;
    addText(slide, "Idea final", 70, 64, 360, 42, { size: 28, bold: true, color: "#93C5FD" });
    addText(slide, "La informacion mutua permite pasar de muchos datos a una explicacion visual de dependencias.", 70, 134, 900, 130, {
      size: 44,
      bold: true,
      color: colors.white,
    });
    addText(slide, "Conclusiones", 72, 338, 240, 36, { size: 28, bold: true, color: "#67E8F9" });
    addText(slide, "1. BEST y WORST quedan balanceados: 502 y 498 registros.\n2. x9 es la variable con mayor entropia en ambos grupos.\n3. x6-x9 es la relacion mas fuerte en ambos arboles.\n4. x3 es la variable que mas cambia su forma de conectarse.", 72, 398, 760, 178, {
      size: 24,
      color: colors.white,
    });
    addText(slide, "10/10", 1110, 642, 86, 34, { size: 20, bold: true, color: colors.white, align: "right" });
    slide.speakerNotes.textFrame.setText([
      "Cerrar regresando a la idea inicial: no se entreno un modelo, se explico la dependencia entre variables.",
      "La frase final puede ser: el arbol resume donde estan las conexiones informativas mas fuertes y que cambia entre BEST y WORST.",
    ]);
  }

  for (const [index, slide] of deck.slides.items.entries()) {
    const num = String(index + 1).padStart(2, "0");
    await writeBlob(path.join(PREVIEW_DIR, `slide-${num}.png`), await deck.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(PREVIEW_DIR, `slide-${num}.layout.json`), await layout.text(), "utf8");
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
