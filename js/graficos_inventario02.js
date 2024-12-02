function cargarInventario02(url) {
  $("#content").load(url, function () {
    inicializarGraficosI02();
  });
}

function inicializarGraficosI02() {
  const campos = [
    "SEHS_ANOP",
    "SEHS APCE",
    "SEHS MICOP",
    "SEHS MNO",
    "SEHS MPN",
    "SEHS-CENTRAL",
  ];
  
  const chartsContainer = document.getElementById("charts-container");
  const campoFilter = document.getElementById("campoFilter");
  
  let charts = []; // Para almacenar instancias de gráficos
  
  // Función para destruir gráficos existentes
  function limpiarGraficos() {
    charts.forEach((chart) => chart.destroy());
    charts = [];
    chartsContainer.innerHTML = ""; // Limpiar el contenedor
  }
  
  // Función para crear un gráfico con filtrado de fecha
  function crearGrafico(campo, fechas, valoresHistoricos) {
    const divGrafico = document.createElement("div");
    divGrafico.classList.add("mb-5");
  
    const chartTitle = document.createElement("h4");
    chartTitle.innerText = `Cantidad de productos inventariados - Campo: ${campo}`;
    chartTitle.style.textAlign = "center"; // Opcional: Centrar el texto del título
    chartTitle.style.marginBottom = "1rem"; // Opcional: Espaciado debajo del título
  
    const labelFecha = document.createElement("label");
    labelFecha.textContent = `Filtrar Año - ${campo}: `;
    labelFecha.classList.add("me-2");
  
    const selectAno = document.createElement("select");
    selectAno.classList.add("form-select", "form-select-sm", "w-auto", "mb-3");
  
    const anosUnicos = [
      "all", // Opción para todos los años
      ...new Set(fechas.map((fecha) => fecha.split("-")[0])),
    ];
  
    anosUnicos.forEach((ano) => {
      const option = document.createElement("option");
      option.value = ano;
      option.textContent = ano === "all" ? "Todos los años" : ano;
      selectAno.appendChild(option);
    });
  
    const canvas = document.createElement("canvas");
    canvas.style.marginBottom = "8vh";
  
    // Añadir elementos al contenedor del gráfico
    divGrafico.appendChild(chartTitle);
    divGrafico.appendChild(labelFecha);
    divGrafico.appendChild(selectAno);
    divGrafico.appendChild(canvas);
    chartsContainer.appendChild(divGrafico);
  
    const ctx = canvas.getContext("2d");
    let chartInstance = null;
  
    const renderChart = (anoSeleccionado) => {
      if (chartInstance) chartInstance.destroy(); // Destruir gráfico previo
  
      let fechasFiltradas = fechas;
      let valoresFiltrados = valoresHistoricos;
  
      if (anoSeleccionado !== "all") {
        fechasFiltradas = fechas.filter((fecha) => fecha.startsWith(anoSeleccionado));
        valoresFiltrados = valoresHistoricos.slice(0, fechasFiltradas.length);
      }
  
      chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: fechasFiltradas,
          datasets: [
            {
              label: "Datos Históricos",
              data: valoresFiltrados,
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
  
      charts.push(chartInstance); // Guardar referencia del gráfico
    };
  
    renderChart("all");
  
    selectAno.addEventListener("change", () => {
      const anoSeleccionado = selectAno.value;
      renderChart(anoSeleccionado);
    });
  }
  
  
  // Función para cargar datos y generar gráficos
  async function cargarYGenerarGraficos(campoSeleccionado = "all") {
    limpiarGraficos();
  
    const camposFiltrados =
      campoSeleccionado === "all" ? campos : [campoSeleccionado];
  
    for (const campo of camposFiltrados) {
      const historicoUrl = `json/inventario02/historico_${campo}.json`;
  
      try {
        const response = await fetch(historicoUrl);
        const data = await response.json();
  
        crearGrafico(campo, data.fechas, data.valores);
      } catch (error) {
        console.error(`Error al cargar datos de ${campo}:`, error);
      }
    }
  }
  
  // Inicializar la página
  function init() {
    // Agregar opciones al filtro de campos
    const optionTodos = document.createElement("option");
    optionTodos.value = "all";
    optionTodos.textContent = "Todos los Campos";
    campoFilter.appendChild(optionTodos);
  
    campos.forEach((campo) => {
      const option = document.createElement("option");
      option.value = campo;
      option.textContent = campo;
      campoFilter.appendChild(option);
    });
  
    campoFilter.addEventListener("change", (event) => {
      const campoSeleccionado = event.target.value;
      cargarYGenerarGraficos(campoSeleccionado);
    });
  
    cargarYGenerarGraficos(); // Cargar gráficos iniciales
  }
  
  init();
  

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
            label: "Predicciones",
            data: data.real_values.map((value, index) => ({
              x: value,
              y: data.predicted_values[index],
            })),
            backgroundColor: "rgba(75, 192, 192, 1)",
            borderColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1,
          },
          {
            label: "Valores Históricos",
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
              text: "Valores Históricos",
            },
            min: Math.min(...data.real_values) - 1,
            max: Math.max(...data.real_values) + 1,
          },
          y: {
            title: {
              display: true,
              text: "Predicciones",
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
            label: "Predicciones",
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
