class RectangleTool extends Tool {
  constructor() {
    super();
    this.rectCount = 0; // Variable para contar los rectángulos dibujados
  }

  draw(e) {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);
    const shape = {
      x: prevMouseX,
      y: prevMouseY,
      width: e.offsetX - prevMouseX,
      height: e.offsetY - prevMouseY,
      color: selectedColor,
      brushWidth: brushWidth,
      fill: this.fillColor.checked,
    };
    this.drawRect(shape);
    this.rectCount++; // Incrementa el contador cada vez que se dibuja un rectángulo
    console.log(`Rectángulos dibujados: ${this.rectCount}`);
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
    const pe = parseFloat(npisos) * 1000 * areaCm2;
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

  // Método para calcular el área (solo un ejemplo, debes definirlo según tu lógica)
  calculateArea(rect) {
    return rect.width * rect.height / 10000; // Convertir a metros cuadrados si el canvas está en px
  }

  // Método para dibujar el texto
  drawText(rect, areaTributaria, areaRectangulo, textY) {
    ctx.fillText(areaTributaria, rect.x, textY - 20);
    ctx.fillText(areaRectangulo, rect.x, textY);
  }
}
