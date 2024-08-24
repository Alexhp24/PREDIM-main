const canvas = document.getElementById('mi-canvas');
const ctx = canvas.getContext('2d');

const boton = document.getElementById('crear-forma');

const select = document.getElementById('opciones');

let formaActiva = false;
let x = 0;
let y = 0;

let formaSeleccionada = '';

boton.addEventListener('click', () => {
  
  formaActiva = true;
  formaSeleccionada = select.value;
});

canvas.addEventListener('mousemove', (e) => {
  if (formaActiva) {
    x = e.offsetX;
    y = e.offsetY;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(x, y, 100, 100);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    switch (formaSeleccionada) {
      case 'a':
        ctx.fillText('A', x + 50, y + 110);
        break;
      case 'b':
        ctx.fillText('B', x + 50, y + 110);
        break;
      case 'c':
        ctx.fillText('C', x + 50, y + 110);
        break;
      default:
        ctx.fillText('Cuadrado', x + 50, y + 110);
    }
  }
});