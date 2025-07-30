let malla = [];

fetch('malla.json')
  .then(res => res.json())
  .then(data => {
    malla = data;
    renderMalla();
  });

const estado = {};

// Lista de códigos de ramos que pueden ser clickeados (edita según lo que necesites)
const ramosClickeables = [
  "AQT0000", "MAT1307", "AQH0000", "AQU0000", "AQC0100", "FIS1032",
  // agrega aquí los códigos que quieras permitir clickear
];

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

      // Solo habilita el checkbox si el ramo está en la lista y puede tomarse
      check.disabled = !(ramosClickeables.includes(ramo.Codigo) && puedeTomar(ramo));

      const label = document.createElement('label');
      label.textContent = ramo.Nombre;

      const div = document.createElement('div');
      div.className = 'ramo';

      if (check.checked) {
        div.classList.add('aprobado');
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
