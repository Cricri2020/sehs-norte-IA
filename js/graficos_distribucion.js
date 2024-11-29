function cargarDistribucion(url) {
    $("#content").load(url, function () {
        inicializarGraficosD();
    });
  }
  
  function inicializarGraficosD() {
    // Cargar datos desde los archivos JSON
Promise.all([
    fetch('json/distribucion/promedio_categoria.json').then((res) => res.json()),
    fetch('json/distribucion/real_vs_predicted.json').then((res) => res.json()),
  ]).then(([promedioCategoria, realVsPredicted]) => {
    // Generar gráfico por categorías
    generarGraficoCategorias(promedioCategoria);
    generarGraficosRealVsPredicted(realVsPredicted);
  });
  
  function generarGraficoCategorias(data) {
    const categorias = [...new Set(data.map((item) => item.categoria))];
    const contenedor = document.getElementById('graficosContainer');
    
    // Limpiar cualquier contenido previo en el contenedor
    contenedor.innerHTML = '';
  
    categorias.forEach((categoria) => {
      // Crear un nuevo contenedor para cada gráfico
      const chartContainer = document.createElement('div');
      chartContainer.style.marginBottom = '8vh';
      chartContainer.innerHTML = `
        <h4>Promedio de productos distribuidos - Categoría: ${categoria}</h4>
        <canvas id="chart-${categoria}"></canvas>
      `;
      contenedor.appendChild(chartContainer);
  
      // Filtrar datos por categoría
      const datosCategoria = data.filter((item) => item.categoria === categoria);
      const fechas = datosCategoria.map((item) => item.fecha.split(' ')[0]);
      const cantidades = datosCategoria.map((item) => item.cantidad);
  
      // Crear el gráfico para esta categoría
      new Chart(document.getElementById(`chart-${categoria}`), {
        type: 'line',
        data: {
          labels: fechas,
          datasets: [
            {
              label: `Promedio - Categoría: ${categoria}`,
              data: cantidades,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: `Promedio - Categoría: ${categoria}`, font: { size: 18 }, },
          },
          scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'Cantidad Promedio' } },
          },
        },
      });
    });
  }
  
  
  function generarGraficosRealVsPredicted(data) {
    const valoresReales = data.map((item) => item.Actual);
    const valoresPredichos = data.map((item) => item.Predicted);
  
    // Gráfico de dispersión
    new Chart(document.getElementById('scatterChart'), {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Valores Predichos',
            data: valoresReales.map((x, i) => ({ x, y: valoresPredichos[i] })),
            backgroundColor: 'rgba(75, 192, 192, 1)',
          },
          {
            label: 'Valores Reales',
            data: [
              { x: Math.min(...valoresReales), y: Math.min(...valoresReales) },
              { x: Math.max(...valoresReales), y: Math.max(...valoresReales) },
            ],
            borderColor: 'rgba(255, 99, 132, 1)',
            type: 'line',
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Valores Reales vs Predichos (Dispersión)', font: { size: 18 }, },
        },
        scales: {
          x: { title: { display: true, text: 'Valores Reales' } },
          y: { title: { display: true, text: 'Valores Predichos' } },
        },
      },
    });
  
    // Gráfico de líneas
    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: Array.from({ length: valoresReales.length }, (_, i) => i + 1),
        datasets: [
          {
            label: 'Valores Reales',
            data: valoresReales,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'Valores Predichos',
            data: valoresPredichos,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Comparación de Valores Reales y Predichos (Líneas)', font: { size: 18 }, },
        },
        scales: {
          x: { title: { display: true, text: 'Índice' } },
          y: { title: { display: true, text: 'Cantidad' } },
        },
      },
    });
  }
  }