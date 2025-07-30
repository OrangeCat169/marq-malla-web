let malla = [];

fetch('malla.json')
  .then(res => res.json())
  .then(data => {
    malla = data;
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

  const porSemestre = {};

  malla.forEach(r => {
    if (!porSemestre[r.Semestre]) porSemestre[r.Semestre] = [];
    porSemestre[r.Semestre].push(r);
  });

  Object.keys(porSemestre).sort((a, b) => a - b).forEach(sem => {
    const bloque = document.createElement('div');
    bloque.className = 'semestre';
    const titulo = document.createElement('h2');
    titulo.textContent = `Semestre ${sem}`;
    bloque.appendChild(titulo);

    porSemestre[sem].forEach(ramo => {
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = estado[ramo.Codigo] || false;
      check.style.display = 'none';

      // Solo habilita el checkbox si puede tomarse y no está aprobado
      const desbloqueado = puedeTomar(ramo) && !check.checked;

      const label = document.createElement('label');
      label.textContent = ramo.Nombre;

      const div = document.createElement('div');
      div.className = 'ramo ' + tipoRamo(ramo.Nombre);

      if (check.checked) {
        div.classList.add('aprobado');
        // Texto "Aprobado" encima
        const aprobadoLabel = document.createElement('span');
        aprobadoLabel.className = 'aprobado-label';
        aprobadoLabel.textContent = 'Aprobado';
        div.appendChild(aprobadoLabel);
      } else if (desbloqueado) {
        div.classList.add('desbloqueado');
        div.addEventListener('click', () => {
          estado[ramo.Codigo] = true;
          renderMalla();
        });
      } else {
        div.classList.add('bloqueado');
      }

      div.appendChild(check);
      div.appendChild(label);
      bloque.appendChild(div);
    });

    contenedor.appendChild(bloque);
  });
}

function puedeTomar(ramo) {
  if (!ramo.Prerrequisitos || ramo.Prerrequisitos.length === 0) return true;
  return ramo.Prerrequisitos.every(pr => estado[pr]);
}
