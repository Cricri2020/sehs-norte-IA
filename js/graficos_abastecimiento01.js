function cargarAbastecimiento01(url) {
  $("#content").load(url, function () {
    inicializarGraficosA01();
  });
}

function inicializarGraficosA01() {
  // Gráfico de Dispersión

  fetch("/json/abastecimiento01/dispersion.json")
    .then((res) => res.json())
    .then((dispersionData) => {
      // Crear la gráfica
      const ctxDispersion = document
        .getElementById("dispersionChart")
        .getContext("2d");

      new Chart(ctxDispersion, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Valores Reales vs Predicciones", // Puntos de dispersión
              data: dispersionData.valores_reales.map((real, i) => ({
                x: real,
                y: dispersionData.predicciones[i],
              })),
              backgroundColor: "rgba(75, 192, 192, 0.6)", // Azul claro
              borderColor: "rgba(75, 192, 192, 1)", // Azul
              pointRadius: 5,
            },
            {
              label: "Línea de Identidad (Real = Predicho)", // Línea roja
              data: dispersionData.valores_reales.map((real) => ({
                x: real,
                y: real,
              })),
              type: "line",
              borderColor: "rgba(255, 0, 0, 1)", // Rojo
              borderWidth: 2,
              fill: false,
              pointRadius: 0, // Sin puntos en la línea
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "Valores Reales vs Predicciones",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Valores Reales",
              },
            },
            y: {
              title: {
                display: true,
                text: "Predicciones",
              },
            },
          },
        },
      });
    })
    .catch((error) => console.error("Error al cargar el JSON:", error));

  // Gráfico de Predicciones vs Reales

  fetch("/json/abastecimiento01/predicciones_vs_reales.json")
    .then((res) => res.json())
    .then((prediccionesVsRealesData) => {
      const ctxPrediccionesVsReales = document
        .getElementById("prediccionesVsRealesChart")
        .getContext("2d");

      new Chart(ctxPrediccionesVsReales, {
        type: "line",
        data: {
          labels: prediccionesVsRealesData.fechas,
          datasets: [
            {
              label: "Valores Reales",
              data: prediccionesVsRealesData.valores_reales,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              tension: 0.4,
            },
            {
              label: "Predicciones",
              data: prediccionesVsRealesData.predicciones,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              tension: 0.4,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "Predicciones vs Valores Reales",
            },
          },
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
                text: "Costos",
              },
            },
          },
        },
      });
    });

  // Gráfico de Predicciones Futuras

  fetch("/json/abastecimiento01/predicciones_futuras.json")
    .then((res) => res.json())
    .then((prediccionesFuturasData) => {
      // Crear el gráfico con dos conjuntos de datos
      const ctxPrediccionesFuturas = document
        .getElementById("prediccionesFuturasChart")
        .getContext("2d");

      new Chart(ctxPrediccionesFuturas, {
        type: "line",
        data: {
          labels: [
            ...prediccionesFuturasData.fechas_historicas, // Fechas históricas primero
            ...prediccionesFuturasData.fechas_futuras, // Fechas futuras después
          ],
          datasets: [
            {
              label: "Costos Históricos",
              data: prediccionesFuturasData.costos_historicos,
              borderColor: "rgba(54, 162, 235, 1)", // Azul
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              tension: 0.4,
            },
            {
              label: "Predicciones Futuras",
              data: [
                ...Array(prediccionesFuturasData.fechas_historicas.length).fill(
                  null
                ), // Los datos históricos no tienen valores futuros
                ...prediccionesFuturasData.predicciones_futuras, // Los valores de las predicciones futuras
              ],
              borderColor: "rgba(255, 99, 132, 1)", // Rojo
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              tension: 0.4,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "Predicciones Futuras y Datos Históricos",
            },
          },
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
                text: "Costos",
              },
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error al cargar los datos del JSON:", error);
    });

  //Gráfico de Comparaciones de Predicciones vs Valores Reales por Año

  fetch("json/abastecimiento01/comparacion_predicciones.json")
    .then((res) => res.json())
    .then((data) => {
      const ctxComparacion = document
        .getElementById("comparacionPrediccionesChart")
        .getContext("2d");

      new Chart(ctxComparacion, {
        type: "line",
        data: {
          labels: data.anios, // Años como etiquetas en el eje X
          datasets: [
            {
              label: "Valor Real",
              data: data.valores_reales,
              borderColor: "rgba(54, 162, 235, 1)", // Azul
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              tension: 0.4,
              pointStyle: "circle",
              pointRadius: 5,
            },
            {
              label: "Predicción",
              data: data.predicciones,
              borderColor: "rgba(255, 99, 132, 1)", // Rojo
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              tension: 0.5,
              pointStyle: "cross",
              pointRadius: 5,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "Comparación de Predicciones vs Valores Reales por Año",
            },
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Año",
              },
            },
            y: {
              title: {
                display: true,
                text: "Costos Totales de Abastecimiento",
              },
              beginAtZero: false,
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error al cargar los datos del JSON:", error);
    });
}
