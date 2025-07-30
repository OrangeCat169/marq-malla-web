let malla = [];

fetch('malla.json')
  .then(res => res.json())
  .then(data => {
    malla = data;
    renderMalla();
  });

const estado = {};

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

      // Solo habilita el checkbox si puede tomarse y no está aprobado
      check.disabled = !puedeTomar(ramo) || check.checked;

      const label = document.createElement('label');
      label.textContent = ramo.Nombre;

      const div = document.createElement('div');
      div.className = 'ramo';

      if (check.checked) {
        div.classList.add('aprobado');
        check.disabled = true;
        // Texto "Aprobado" encima
        const aprobadoLabel = document.createElement('span');
        aprobadoLabel.className = 'aprobado-label';
        aprobadoLabel.textContent = 'Aprobado';
        div.appendChild(aprobadoLabel);
      } else if (!check.disabled) {
        div.classList.add('desbloqueado');
      } else {
        div.classList.add('bloqueado');
      }

      check.addEventListener('change', () => {
        estado[ramo.Codigo] = check.checked;
        renderMalla();
      });

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
