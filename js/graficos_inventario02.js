function cargarInventario02(url) {
  $("#content").load(url, function () {
    inicializarGraficosI02();
  });
}

function inicializarGraficosI02() {
  // Función para crear un gráfico
  function crearGrafico(
    canvasId,
    fechas,
    valoresHistoricos,
    valoresPredicciones
  ) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: fechas,
        datasets: [
          {
            label: "Datos Históricos",
            data: valoresHistoricos,
            borderColor: "blue",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Fecha",
            },
          },
          y: {
            title: {
              display: true,
              text: "Cantidad de Productos",
            },
          },
        },
      },
    });
  }

  // Función para cargar los datos desde los archivos JSON y generar los gráficos
  async function cargarYGenerarGraficos() {
    const campos = [
      "SEHS_ANOP",
      "SEHS APCE",
      "SEHS MICOP",
      "SEHS MNO",
      "SEHS MPN",
      "SEHS-CENTRAL",
    ];

    // Recorrer las categorías y cargar sus datos
    for (const campo of campos) {
      const historicoUrl = `json/inventario02/historico_${campo}.json`;
      const prediccionesUrl = `json/inventario02/predicciones_${campo}.json`;

      // Cargar los archivos JSON para los datos históricos y las predicciones
      const [historicoResponse, prediccionesResponse] = await Promise.all([
        fetch(historicoUrl),
        fetch(prediccionesUrl),
      ]);

      const historicoData = await historicoResponse.json();
      const prediccionesData = await prediccionesResponse.json();

      // Crear un contenedor para cada gráfico
      const chartContainer = document.createElement("div");
      chartContainer.style.marginBottom = "8vh";
      const chartTitle = document.createElement("h4");
      chartTitle.innerText = `Cantidad de productos inventariados - Campo: ${campo}`;
      chartContainer.appendChild(chartTitle);
      const canvas = document.createElement("canvas");
      canvas.id = `chart_${campo}`;
      canvas.width = 600;
      canvas.height = 400;
      chartContainer.appendChild(canvas);
      document.getElementById("charts-container").appendChild(chartContainer);

      // Crear el gráfico utilizando los datos
      crearGrafico(
        `chart_${campo}`,
        historicoData.fechas,
        historicoData.valores,
        prediccionesData.valores
      );
    }
  }

  // Llamar a la función para cargar los datos y generar los gráficos al cargar la página
  cargarYGenerarGraficos();

  // Función para cargar los datos desde el archivo JSON
  async function fetchData() {
    const response = await fetch("json/inventario02/comparison_data.json"); // Asegúrate de tener el archivo en tu servidor
    const data = await response.json();
    return data;
  }

  // Función para graficar los datos de dispersión y tendencia
  async function createCharts() {
    const data = await fetchData();

    new Chart(document.getElementById("scatterChart"), {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Valores Reales vs Predichos",
            data: data.real_values.map((value, index) => ({
              x: value,
              y: data.predicted_values[index],
            })),
            backgroundColor: "rgba(75, 192, 192, 1)",
            borderColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1,
          },
          {
            label: "Línea de Igualdad",
            data: data.real_values.map((value) => ({
              x: value,
              y: value,
            })),
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
            fill: false,
            tension: 0,
            pointRadius: 0,
            showLine: true,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Valores Reales",
            },
            min: Math.min(...data.real_values) - 1,
            max: Math.max(...data.real_values) + 1,
          },
          y: {
            title: {
              display: true,
              text: "Valores Predichos",
            },
            min: Math.min(...data.predicted_values) - 1,
            max: Math.max(...data.predicted_values) + 1,
          },
        },
      },
    });

    // Gráfico de comparación de tendencias
    new Chart(document.getElementById("trendChart"), {
      type: "line",
      data: {
        labels: Array.from(
          { length: data.real_values.length },
          (_, i) => i + 1
        ), // Crear etiquetas de índice
        datasets: [
          {
            label: "Valores Reales",
            data: data.real_values,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: false,
            tension: 0.1,
            pointStyle: "circle",
            pointRadius: 5,
          },
          {
            label: "Valores Predichos",
            data: data.predicted_values,
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
            fill: false,
            tension: 0.1,
            pointStyle: "circle",
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Índice",
            },
          },
          y: {
            title: {
              display: true,
              text: "Cantidad",
            },
          },
        },
      },
    });
  }

  // Ejecutar la función para crear los gráficos
  createCharts();
}
