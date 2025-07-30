let malla = [];

fetch('malla.json')
  .then(res => res.json())
  .then(data => {
    malla = data;
    grupoPorCodigo = mapearGrupos(malla);
    renderMalla();
  });

const estado = {};

function tipoRamo(nombre) {
  nombre = nombre.toLowerCase();
  if (nombre.includes('taller')) return 'taller';
  if (nombre.includes('ciudad') || nombre.includes('paisaje') || nombre.includes('urbanismo')) return 'ciudad';
  if (nombre.includes('historia') || nombre.includes('moderna') || nombre.includes('antigua') || nombre.includes('debates')) return 'historia';
  if (nombre.includes('construcción') || nombre.includes('estructurales') || nombre.includes('sismo') || nombre.includes('instalaciones') || nombre.includes('técnicas')) return 'construccion';
  if (nombre.includes('física') || nombre.includes('fisica')) return 'fisica';
  if (nombre.includes('optativo')) return 'optativo';
  return '';
}

function renderMalla() {
  const contenedor = document.getElementById('contenedor-malla');
  contenedor.innerHTML = '';

  // Agrupa ramos por semestre
  const porSemestre = {};
  malla.forEach(r => {
    if (!porSemestre[r.Semestre]) porSemestre[r.Semestre] = [];
    porSemestre[r.Semestre].push(r);
  });

  // Calcula el máximo año
  const semestres = Object.keys(porSemestre).map(Number).sort((a, b) => a - b);
  const maxSemestre = Math.max(...semestres);
  maxAnio = Math.ceil(maxSemestre / 2);

  // Solo renderiza el año actual
  const year = anioActual;
  const bloqueAnio = document.createElement('div');
  bloqueAnio.className = 'bloque-anio';

  // Título del año
  const tituloAnio = document.createElement('div');
  tituloAnio.className = 'titulo-anio';
  tituloAnio.textContent = `Año ${year}`;
  bloqueAnio.appendChild(tituloAnio);

  // Contenedor de semestres de este año
  const contSemestres = document.createElement('div');
  contSemestres.className = 'anio-semestres';

  // Semestre i y i+1
  const i = (year - 1) * 2 + 1;
  [i, i + 1].forEach(sem => {
    if (porSemestre[sem]) {
      const bloque = document.createElement('div');
      bloque.className = 'semestre';
      const titulo = document.createElement('h2');
      titulo.textContent = `Semestre ${sem}`;
      bloque.appendChild(titulo);

      porSemestre[sem].forEach(ramo => {
        const aprobado = estado[ramo.Codigo] || false;
        const desbloqueado = puedeTomar(ramo) && !aprobado;

        const div = document.createElement('div');
        div.className = 'ramo ' + tipoRamo(ramo.Nombre);

        if (aprobado) {
          div.classList.add('aprobado');
          const aprobadoLabel = document.createElement('span');
          aprobadoLabel.className = 'aprobado-label';
          aprobadoLabel.textContent = 'Aprobado';
          div.appendChild(aprobadoLabel);
        } else if (desbloqueado) {
          div.classList.add('desbloqueado');
          div.addEventListener('click', (e) => {
            estado[ramo.Codigo] = true;
            // Coordenadas del click relativas a la ventana
            lanzarFuegosArtificiales(e.clientX, e.clientY);
            renderMalla();
          });
        } else {
          div.classList.add('bloqueado');
        }

        const label = document.createElement('span');
        label.textContent = ramo.Nombre;
        label.className = 'ramo-nombre';
        div.appendChild(label);

        const grupo = grupoPorCodigo[ramo.Codigo] ?? 0;
        const color = grupoColores[grupo % grupoColores.length];

        // Esquina de color para el grupo de conexión
        const esquina = document.createElement('span');
        esquina.className = 'esquina-color';
        esquina.style.background = color;
        div.appendChild(esquina);

        bloque.appendChild(div);
      });

      contSemestres.appendChild(bloque);
    }
  });

  bloqueAnio.appendChild(contSemestres);
  contenedor.appendChild(bloqueAnio);

  // Actualiza el label del año
  document.getElementById('anio-label').textContent = `Año ${anioActual}`;
  // Desactiva botones si corresponde
  document.getElementById('anio-prev').disabled = (anioActual === 1);
  document.getElementById('anio-next').disabled = (anioActual === maxAnio);

  const decoracion = document.createElement('div');
  decoracion.className = 'decoracion-anio';
  decoracion.innerHTML = `
    <span class="texto-tierno" style="--delay:0.1s;">¡Año de grandes sueños!</span>
    <span class="texto-tierno" style="--delay:0.7s;">Sigue brillando 🌟</span>
    <span class="texto-tierno" style="--delay:1.3s;">¡Tú puedes!</span>
    <span class="texto-tierno" style="--delay:1.9s;">Con cariño y dedicación 💖</span>
  `;
  bloqueAnio.appendChild(decoracion);
}

function puedeTomar(ramo) {
  if (!ramo.Prerrequisitos || ramo.Prerrequisitos.length === 0) return true;
  return ramo.Prerrequisitos.every(pr => estado[pr]);
}

const grupoColores = [
  "#ffb300", // amarillo
  "#29b6f6", // celeste
  "#ab47bc", // violeta
  "#66bb6a", // verde
  "#ef5350", // rojo
  "#ffa726", // naranjo
  "#8d6e63", // café
  "#5c6bc0", // azul
  "#ec407a", // rosado
  "#26a69a", // turquesa
];

// Mapea cada código de ramo a un grupo de conexión (por prerrequisito)
function mapearGrupos(malla) {
  const grupoPorCodigo = {};
  let grupoId = 0;
  const visitados = {};

  function dfs(codigo, id) {
    if (visitados[codigo]) return;
    visitados[codigo] = true;
    grupoPorCodigo[codigo] = id;
    const ramo = malla.find(r => r.Codigo === codigo);
    if (!ramo) return;
    // Conecta hacia adelante (ramos que dependen de este)
    malla.forEach(r => {
      if (r.Prerrequisitos && r.Prerrequisitos.includes(codigo)) {
        dfs(r.Codigo, id);
      }
    });
    // Conecta hacia atrás (prerrequisitos de este)
    if (ramo.Prerrequisitos) {
      ramo.Prerrequisitos.forEach(pr => dfs(pr, id));
    }
  }

  malla.forEach(r => {
    if (!visitados[r.Codigo]) {
      dfs(r.Codigo, grupoId++);
    }
  });

  return grupoPorCodigo;
}

function lanzarFuegosArtificiales(x, y) {
  const container = document.getElementById('fireworks-container');
  // Solo tonos de rosado
  const colors = [
    '#f8bbd0', // rosa pastel
    '#f06292', // rosa fuerte
    '#ec407a', // fucsia
    '#ad1457', // magenta oscuro
    '#ff80ab', // rosa claro
    '#fce4ec', // rosa muy claro
    '#d81b60', // magenta
    '#ffb6c1', // pink
    '#e75480', // pink medio
    '#ff69b4'  // hot pink
  ];
  const num = 18 + Math.floor(Math.random() * 6);

  for (let i = 0; i < num; i++) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    const color = colors[Math.floor(Math.random() * colors.length)];
    firework.style.background = color;
    firework.style.width = firework.style.height = `${8 + Math.random() * 8}px`;
    firework.style.left = `${x - 8}px`;
    firework.style.top = `${y - 8}px`;
    firework.style.opacity = 1;
    container.appendChild(firework);

    const angle = (2 * Math.PI * i) / num;
    const distance = 80 + Math.random() * 60;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    firework.animate([
      { transform: 'translate(0,0)', opacity: 1 },
      { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }
    ], {
      duration: 900 + Math.random() * 400,
      easing: 'cubic-bezier(.61,.01,.98,.53)'
    });

    setTimeout(() => firework.remove(), 1200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mallaRect = document.getElementById('malla-rect');
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  function setZoom(val) {
    mallaRect.style.transform = `scale(${val/100})`;
    zoomValue.textContent = `${val}%`;
  }
  setZoom(zoomSlider.value);
  zoomSlider.addEventListener('input', () => setZoom(zoomSlider.value));

  document.getElementById('boton-amor').onclick = () => {
    const mensaje = document.getElementById('mensaje-amor');
    const corazones = document.getElementById('corazones-vuelo');
    const audio = document.getElementById('audio-amor');
    mensaje.style.display = 'block';
    mensaje.style.opacity = '1';

    // Reproduce el sonido bonito
    audio.currentTime = 0;
    audio.play();

    // Genera muchos corazones volando
    for (let i = 0; i < 34; i++) {
      const heart = document.createElement('span');
      heart.textContent = ['💗','💖','💕','💞','💓'][Math.floor(Math.random()*5)];
      heart.style.position = 'fixed';
      heart.style.left = `${10 + Math.random()*80}%`;
      heart.style.bottom = '-40px';
      heart.style.fontSize = `${1.5 + Math.random()*2.5}em`;
      heart.style.opacity = 0.8 + Math.random()*0.2;
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = 2100;
      heart.style.transition = 'transform 2.2s cubic-bezier(.68,-0.55,.27,1.55), opacity 2.2s';
      corazones.appendChild(heart);

      setTimeout(() => {
        heart.style.transform = `translateY(-${320 + Math.random()*120}px) scale(${0.8 + Math.random()*1.2}) rotate(${Math.random()*60-30}deg)`;
        heart.style.opacity = 0;
      }, 30 + Math.random()*300);

      setTimeout(() => heart.remove(), 2300 + Math.random()*400);
    }

    setTimeout(() => {
      mensaje.style.opacity = '0';
      setTimeout(() => { mensaje.style.display = 'none'; }, 400);
    }, 2200);
  };
});

let anioActual = 1;
let maxAnio = 1;

document.getElementById('anio-prev').onclick = () => {
  if (anioActual > 1) {
    anioActual--;
    renderMalla();
  }
};
document.getElementById('anio-next').onclick = () => {
  if (anioActual < maxAnio) {
    anioActual++;
    renderMalla();
  }
};