document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("color-picker");

  const npisosInput = document.getElementById("npisos");

  //const ZpisosInput = parseFloat(document.getElementById("Zpisos").value);
  let ZpisosInput = 0;
  document.getElementById("Zpisos").addEventListener("input", () => {
    ZpisosInput = parseFloat(document.getElementById("Zpisos").value);
    console.log(ZpisosInput);
  });
  //Zsuelo
  let ZsuelosInput = 0;
  document.getElementById("Zsuelos").addEventListener("input", () => {
    ZsuelosInput = parseFloat(document.getElementById("Zsuelos").value);
    console.log(ZsuelosInput);
  });



////
  // const ZsuelosInput = parseFloat(document.getElementById("Zsuelos").value);

  const uploadPDFInput = document.getElementById("upload-pdf");

  let prevMouseX,
    prevMouseY,
    isDrawing = false,
    snapshot;
  let selectedTool = "rectangle",
    brushWidth = 5,
    selectedColor = "#000";
  let fillColor = { checked: false };
  let shapes = []; // Array para almacenar todas las formas dibujadas
  let pdfSnapshot = null;

  // Función para cargar y renderizar un PDF en el canvas
  uploadPDFInput.addEventListener("change", () => {
    const file = uploadPDFInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const pdfData = event.target.result;

      // Limpiar canvas antes de renderizar PDF
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Renderizar la primera página del PDF en el canvas
      pdfjsLib
        .getDocument({ data: pdfData })
        .promise.then((pdf) => pdf.getPage(1))
        .then((page) => {
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
          return page.render(renderContext).promise;
        })
        .then(() => {
          // Guardar una copia del PDF renderizado para referencia futura
          pdfSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        })
        .catch((error) => {
          console.error("Error al renderizar el PDF:", error);
        });
    };

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  });

  // Clase base para herramientas de dibujo
  class Tool {
    constructor(ctx, fillColor, selectedColor, brushWidth) {
      this.ctx = ctx;
      this.fillColor = fillColor;
      this.selectedColor = selectedColor;
      this.brushWidth = brushWidth;
      this.drawing = false; // Añadido para controlar si se está dibujando
    }

    startDrawing(e) {
      if (this.drawing) return; // Prevenir el inicio de un nuevo dibujo si ya se está dibujando
      prevMouseX = e.offsetX;
      prevMouseY = e.offsetY;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      isDrawing = true;
      this.drawing = true;
    }

    stopDrawing(e) {
      if (isDrawing) {
        this.saveShape(e);
      }
      isDrawing = false;
      this.drawing = false; // Permitir el inicio de un nuevo dibujo
    }

    draw(e) {
      // Método a ser sobrescrito por las herramientas específicas
    }

    saveShape(e) {
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
        tool: selectedTool,
      };
      shapes.push(shape);
      redrawAllShapes();
    }

    calculateArea(shape) {
      // Función para calcular el área de la forma
      const scale = 0.02; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (113 * scale);
      const baseCm = shape.width * pixelToCm;
      const alturaCm = shape.height * pixelToCm;
      const areaCm2 = baseCm * alturaCm;
      return areaCm2;
    }

    drawText(shape, areaText, areaTextAC, textY) {
      const textWidth = ctx.measureText(areaText).width;
      const textX = shape.x + shape.width / 2 - textWidth / 2;
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(areaText, textX, textY);
      ctx.fillText(areaTextAC, textX, textY + 10);
    }
  }

  //Clase Rectangulo y operacion..................................
  class RectangleTool extends Tool {
    draw(e) {
      if (!isDrawing) return;
      ctx.putImageData(snapshot, 0, 0);
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
      };
      this.drawRect(shape);
    }
    drawRect(rect) {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.lineWidth = rect.brushWidth;
      ctx.strokeStyle = rect.color;
      ctx.stroke();
      if (rect.fill) {
        ctx.fillStyle = rect.color;
        ctx.fill();
      }
      const areaCm2 = this.calculateArea(rect);
      const npisos = npisosInput.value;

      // console.log(areaCm2);

      const pe = parseFloat(npisos) * 1000 * areaCm2;
      // console.log (pe);
      //
      const Ar = pe / (0.45 * Math.sqrt(210, 2));

      const AreaTributaria = `AT: ${areaCm2.toFixed(2)} m²`;

      const areaRectangulo = `Ar: ${Ar.toFixed(2)} cm²`;

      const LadoRec = `LR: ${(Ar / 30).toFixed(2)} cm²`;

      const textY = rect.y + rect.height / 2;
      const textX =
        rect.x + rect.width / 2 - ctx.measureText(AreaTributaria).width / 2;

      this.drawText(rect, AreaTributaria, areaRectangulo, textY);
      ctx.fillText(LadoRec, textX, textY + 20);
    }
  }

  //Clase Cuadrado y operacionn.................
  class CuadradoTool extends Tool {
    draw(e) {
      if (!isDrawing) return;
      ctx.putImageData(snapshot, 0, 0);
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
      };
      this.drawCuadrado(shape);
    }

    drawCuadrado(square) {
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const npisos = npisosInput.value;

      const Ac = (
        (parseFloat(areaCm2) * parseFloat(npisos) * 1000) /
        (0.45 * 210)
      ).toFixed(2);

      const Acuadrado = areaCm2;

      const areaText = `AT: ${areaCm2.toFixed(2)} m2`;

      const areaTextAC = `AC: ${Ac} cm2`;

      const areaTextACuadrado = `Lc: ${Math.sqrt(Ac, 2).toFixed(2)} m2`;

      const textY = square.y + square.height / 2;
      const textX =
        square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(areaTextACuadrado, textX, textY + 20);
    }
  }
  //clase circulo y operacion CIRCULACION..........................
  class CirculoTool extends Tool {
    draw(e) {
      if (!isDrawing) return;
      ctx.putImageData(snapshot, 0, 0);
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
      };
      this.drawCirculo(shape);
    }

    drawCirculo(square) {
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const npisos = npisosInput.value;

      const Ac = (
        (parseFloat(areaCm2) * parseFloat(npisos) * 1000) /
        ((0.45 * 210) ^ 0.5)
      ).toFixed(2);

      const Acuadrado = areaCm2;

      const areaText = `AT: ${areaCm2.toFixed(2)} m2`;

      const areaTextAC = `AC: ${Ac} cm2`;

      const areaTextACuadrado = `Radio: ${Math.sqrt(Ac / (2 * 3.14), 2).toFixed(
        2
      )} m`;

      const textY = square.y + square.height / 2;
      const textX =
        square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(areaTextACuadrado, textX, textY + 20);
    }
  }

  //clase te y operacion
  class TeTool extends Tool {
    draw(e) {
      if (!isDrawing) return;
      ctx.putImageData(snapshot, 0, 0);
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
      };
      this.drawTe(shape);
    }

    drawTe(square) {
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const npisos = npisosInput.value;
      const Ac = (
        (parseFloat(areaCm2) * parseFloat(npisos) * 1000) /
        (0.45 * 210)
      ).toFixed(2);
      const areaText = `AT: ${areaCm2.toFixed(2)} m²`;
      const areaTextAC = `AC: ${Ac} cm²`;
      const areaT = `A⫟: ${(Ac - 900 / 60).toFixed(2)} m²`;
      const textY = square.y + square.height / 2;
      const textX =
        square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(areaT, textX, textY + 20);
    }
  }

  //clase ele y operacion
  class EleTool extends Tool {
    draw(e) {
      if (!isDrawing) return;
      ctx.putImageData(snapshot, 0, 0);
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
      };
      this.drawEle(shape);
    }

    drawEle(square) {
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const npisos = npisosInput.value;
      const Ac = (
        (parseFloat(areaCm2) * parseFloat(npisos) * 1000) /
        (0.45 * 210)
      ).toFixed(2);
      const areaText = `AT: ${areaCm2.toFixed(2)} m²`;
      const areaTextAC = `AC: ${Ac} cm²`;
      const AreaEle = `AL: ${(Ac - 900 / 60).toFixed(2)} m²`;
      const textY = square.y + square.height / 2;
      const textX =
        square.x + square.width / 2 - ctx.measureText(areaText).width / 2;
      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(AreaEle, textX, textY + 20);
    }
  }
  //Secciona de vigas (class cuadrado) Clase CuadradoVigasTool y operación:::::::::::::::::::::
  class CuadradoVigasTool extends Tool {
    draw(e) {
      if (!isDrawing) return;
      ctx.putImageData(snapshot, 0, 0);
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
      };
      this.drawCuadradoVigas(shape);
    }

    drawCuadradoVigas(square) {
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      /* const npisos = npisosInput.value; */
      /* const Ac = ((parseFloat(areaCm2) * parseFloat(npisos) * 1000) / (0.45 * 210)).toFixed(2); */
      const areaText = ``;

      /* const areaTextAC = `AC: ${Ac} cm²`; */
      //formula

      const luz = Math.max(square.width, square.height).toFixed(2);

      const Luz = `L: ${luz} m`;
      const Base = `B= 30 cm`;
      const Altura = `h: ${(luz / 14).toFixed(2)} m`;

      const textY = square.y + square.height / 2;
      const textX =
        square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX, textY + 5);
      ctx.fillText(Luz, textX, textY + 15);
      ctx.fillText(Base, textX, textY + 25);
      ctx.fillText(Altura, textX, textY + 35);
    }
  }
  //Seccion de pestaña zapata y operacion.......................................
  class CuadradoZapataTool extends Tool {
    draw(e) {
      if (!isDrawing) return;
      ctx.putImageData(snapshot, 0, 0);
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
      };
      this.drawCuadradoZapata(shape);
    }

    drawCuadradoZapata(square) {
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }
      const areaCm2 = this.calculateArea(square);
      // pe..
      const pe = ZpisosInput * 1000 * areaCm2;
      const Ac = pe / (0.45 * Math.sqrt(210, 2));

      const An = (1.0 * ZpisosInput * areaCm2) / ZsuelosInput;
      console.log(ZpisosInput);

      const areaText = `AT: ${areaCm2.toFixed(2)} m²`;

      const areaTextAC = `AC: ${Ac.toFixed(2)} cm²`;

      console.log(An);

      // const AreaZapata = Ac / 25; // Corrección: usar Ac directamente en el cálculoddad
      const Az = `Az ${An.toFixed(2)} m²`; // Asegúrate de formatear correctamente el resultado

      const textY = square.y + square.height / 2;
      const textX =
        square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(Az, textX, textY + 25);
    }
  }
  //Seccion de pestaña Lozas y operacion
  class CuadradoLosasTool extends Tool {
    draw(e) {
      if (!isDrawing) return;
      ctx.putImageData(snapshot, 0, 0);
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        fill: this.fillColor.checked,
      };
      this.drawCuadradoLosas(shape);
    }

    drawCuadradoLosas(square) {
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);

      const LusLosas = Math.min(square.height, square.width);

      const areaText = `Luz: ${LusLosas.toFixed(2)} m`;
      //formula
      // const AreaLosas = (Math.max(square.width, square.height) / 25).toFixed(2);
      console.log(square.height);
      console.log(square.width);
      console.log(LusLosas);

      const AreaCuadradoLosas = `B = 30 cm`;
   
      const altura =`H ${(LusLosas / 25).toFixed(2) }`;

      const textY = square.y + square.height / 2;
      const textX =
        square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX, textY + 5);
      ctx.fillText(AreaCuadradoLosas, textX, textY + 15);
      ctx.fillText(altura,textX,textY + 25);
    }
  }

  // Objeto para acceder a las herramientas por nombre
  const tools = {
    rectangle: new RectangleTool(ctx, fillColor, selectedColor, brushWidth),
    cuadrado: new CuadradoTool(ctx, fillColor, selectedColor, brushWidth),
    circulo: new CirculoTool(ctx, fillColor, selectedColor, brushWidth),
    te: new TeTool(ctx, fillColor, selectedColor, brushWidth),
    ele: new EleTool(ctx, fillColor, selectedColor, brushWidth),
    cuadradovigas: new CuadradoVigasTool(
      ctx,
      fillColor,
      selectedColor,
      brushWidth
    ),
    cuadradozapata: new CuadradoZapataTool(
      ctx,
      fillColor,
      selectedColor,
      brushWidth
    ),
    cuadradolosas: new CuadradoLosasTool(
      ctx.fillColor,
      selectedColor,
      brushWidth
    ),
  };

  //funcion para redibujar  todas las
  function redrawAllShapes() {
    if (pdfSnapshot) {
      ctx.putImageData(pdfSnapshot, 0, 0);
    }
    shapes.forEach((shape) => {
      const tool = tools[shape.tool];
      // Llamar al método draw con un objeto de evento simulado para redibujar la forma
      // Crear un evento falso con las coordenadas de la forma almacenada
      const simulatedEvent = {
        offsetX: shape.x + shape.width,
        offsetY: shape.y + shape.height,
      };
      tool.draw(simulatedEvent);
    });
  }

  // Función para manejar el dibujo en el canvas
  function draw(e) {
    if (!isDrawing) return;
    tools[selectedTool].draw(e);
  }

  // Eventos para manejar el dibujo en el canvas
  canvas.addEventListener("mousedown", (e) => {
    tools[selectedTool].startDrawing(e);
  });

  canvas.addEventListener("mouseup", (e) => {
    tools[selectedTool].stopDrawing(e);
  });

  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });

  // Eventos para seleccionar la herramienta y el color
  document.querySelectorAll(".tool").forEach((button) => {
    button.addEventListener("click", (e) => {
      selectedTool = e.currentTarget.getAttribute("data-tool");
    });
  });

  // Slecciona,os el color
  // colorPicker.addEventListener("change", (e) => {
  //     selectedColor = e.target.value;
  // });
});
