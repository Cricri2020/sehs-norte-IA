function cargarAbastecimiento01(url) {
  $("#content").load(url, function () {
    inicializarGraficosA01();
  });
}

function inicializarGraficosA01() {
  // Gráfico de Dispersión
  fetch("json/abastecimiento01/dispersion.json")
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
              label: "Predicciones", // Puntos de dispersión
              data: dispersionData.valores_reales.map((real, i) => ({
                x: real,
                y: dispersionData.predicciones[i],
              })),
              backgroundColor: "rgba(75, 192, 192, 0.6)", // Azul claro
              borderColor: "rgba(75, 192, 192, 1)", // Azul
              pointRadius: 5,
            },
            {
              label: "Valores Históricos", // Línea roja
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
              font: { size: 18 },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Valores Históricos",
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
  fetch("json/abastecimiento01/predicciones_vs_reales.json")
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
              label: "Valores Históricos",
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
              font: { size: 18 },
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
  let prediccionesChart;
  fetch("json/abastecimiento01/predicciones_futuras.json")
    .then((res) => res.json())
    .then((prediccionesFuturasData) => {
      // Extraer años únicos de las fechas
      const allYears = [
        ...new Set([
          ...prediccionesFuturasData.fechas_historicas.map((fecha) =>
            new Date(fecha).getFullYear()
          ),
          ...prediccionesFuturasData.fechas_futuras.map((fecha) =>
            new Date(fecha).getFullYear()
          ),
        ]),
      ];

      // Crear opciones en el <select>
      const filterSelect = document.getElementById(
        "filterYearPrediccionesFuturas"
      );
      allYears.forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        filterSelect.appendChild(option);
      });

      // Función para filtrar datos según el año seleccionado
      const filterDataByYear = (year) => {
        const filteredLabels = [];
        const filteredHistoricos = [];
        const filteredFuturos = [];

        prediccionesFuturasData.fechas_historicas.forEach((fecha, index) => {
          const currentYear = new Date(fecha).getFullYear();
          if (year === "all" || currentYear === parseInt(year)) {
            filteredLabels.push(fecha);
            filteredHistoricos.push(
              prediccionesFuturasData.costos_historicos[index]
            );
            filteredFuturos.push(null); // Mantener valores futuros como null
          }
        });

        prediccionesFuturasData.fechas_futuras.forEach((fecha, index) => {
          const currentYear = new Date(fecha).getFullYear();
          if (year === "all" || currentYear === parseInt(year)) {
            filteredLabels.push(fecha);
            filteredHistoricos.push(null); // Mantener valores históricos como null
            filteredFuturos.push(
              prediccionesFuturasData.predicciones_futuras[index]
            );
          }
        });

        return { filteredLabels, filteredHistoricos, filteredFuturos };
      };

      // Crear el gráfico inicial
      const createChart = (data) => {
        const ctxPrediccionesFuturas = document
          .getElementById("prediccionesFuturasChart")
          .getContext("2d");

        return new Chart(ctxPrediccionesFuturas, {
          type: "line",
          data: {
            labels: data.filteredLabels,
            datasets: [
              {
                label: "Costos Históricos",
                data: data.filteredHistoricos,
                borderColor: "rgba(54, 162, 235, 1)", // Azul
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.4,
              },
              {
                label: "Predicciones Futuras",
                data: data.filteredFuturos,
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
                font: { size: 18 },
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
      };

      // Filtrar datos y crear el gráfico inicial
      const initialData = filterDataByYear("all");
      prediccionesChart = createChart(initialData);

      // Actualizar el gráfico cuando se seleccione un año
      filterSelect.addEventListener("change", (event) => {
        const selectedYear = event.target.value;
        const filteredData = filterDataByYear(selectedYear);

        prediccionesChart.data.labels = filteredData.filteredLabels;
        prediccionesChart.data.datasets[0].data =
          filteredData.filteredHistoricos;
        prediccionesChart.data.datasets[1].data = filteredData.filteredFuturos;
        prediccionesChart.update();
      });
    })
    .catch((error) => {
      console.error("Error al cargar los datos del JSON:", error);
    });

  //Gráfico de Comparaciones de Predicciones vs Valores Reales por Año
  fetch("json/abastecimiento01/comparacion_predicciones.json")
    .then((res) => res.json())
    .then((data) => {
      // Validar y filtrar años únicos válidos
      const validYears = [
        ...new Set(
          data.anios.map((anio) =>
            isNaN(parseInt(anio)) ? null : parseInt(anio)
          )
        ),
      ].sort();

      // Mostrar años válidos en la consola (para depuración)
      console.log("Años válidos detectados:", validYears);

      // Crear opciones en el <select>
      const filterSelect = document.getElementById("filterYearComparacion");
      validYears.forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        filterSelect.appendChild(option);
      });

      // Función para filtrar los datos según el año seleccionado
      const filterDataByYear = (year) => {
        const filteredLabels = [];
        const filteredValoresReales = [];
        const filteredPredicciones = [];

        data.anios.forEach((anio, index) => {
          if (year === "all" || parseInt(anio) === parseInt(year)) {
            filteredLabels.push(anio);
            filteredValoresReales.push(data.valores_reales[index]);
            filteredPredicciones.push(data.predicciones[index]);
          }
        });

        return { filteredLabels, filteredValoresReales, filteredPredicciones };
      };

      // Crear el gráfico inicial
      const createChart = (filteredData) => {
        const ctxComparacion = document
          .getElementById("comparacionPrediccionesChart")
          .getContext("2d");

        return new Chart(ctxComparacion, {
          type: "line",
          data: {
            labels: filteredData.filteredLabels,
            datasets: [
              {
                label: "Valor Histórico",
                data: filteredData.filteredValoresReales,
                borderColor: "rgba(54, 162, 235, 1)", // Azul
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.4,
                pointStyle: "circle",
                pointRadius: 5,
              },
              {
                label: "Predicción",
                data: filteredData.filteredPredicciones,
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
                font: { size: 18 },
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
      };

      // Filtrar datos y crear el gráfico inicial
      const initialData = filterDataByYear("all");
      const comparacionChart = createChart(initialData);

      // Actualizar el gráfico cuando se seleccione un año
      filterSelect.addEventListener("change", (event) => {
        const selectedYear = event.target.value;
        const filteredData = filterDataByYear(selectedYear);

        comparacionChart.data.labels = filteredData.filteredLabels;
        comparacionChart.data.datasets[0].data =
          filteredData.filteredValoresReales;
        comparacionChart.data.datasets[1].data =
          filteredData.filteredPredicciones;
        comparacionChart.update();
      });
    })
    .catch((error) => {
      console.error("Error al cargar los datos del JSON:", error);
    });
}
