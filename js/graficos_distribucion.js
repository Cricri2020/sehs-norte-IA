function cargarDistribucion(url) {
  $("#content").load(url, function () {
    inicializarGraficosD();
  });
}

function inicializarGraficosD() {
  // Cargar datos desde los archivos JSON
  Promise.all([
    fetch("json/distribucion/promedio_categoria.json").then((res) =>
      res.json()
    ),
    fetch("json/distribucion/real_vs_predicted.json").then((res) => res.json()),
  ]).then(([promedioCategoria, realVsPredicted]) => {
    // Generar gráfico por categorías
    generarGraficoCategorias(promedioCategoria);
    generarGraficosRealVsPredicted(realVsPredicted);
  });

  function generarGraficoCategorias(data) {
    const categorias = [...new Set(data.map((item) => item.categoria))];
    const contenedor = document.getElementById("graficosContainer");

    // Limpiar cualquier contenido previo en el contenedor
    contenedor.innerHTML = "";

    // Crear el filtro general de grupo
    const filtroGrupoContainer = document.createElement("div");
    filtroGrupoContainer.innerHTML = `
        <div class="d-flex align-items-center mb-3">
          <label for="selectGrupo" class="me-2">Seleccionar Grupo:</label>
          <select id="selectGrupo" class="form-select form-select-sm w-auto">
            <option value="all">Todos los grupos</option>
            ${categorias
              .map(
                (categoria) =>
                  `<option value="${categoria}">${categoria}</option>`
              )
              .join("")}
          </select>
        </div>
        
      `;
    contenedor.appendChild(filtroGrupoContainer);

    // Crear gráficos para cada categoría
    categorias.forEach((categoria) => {
      // Crear un nuevo contenedor para cada gráfico
      const chartContainer = document.createElement("div");
      chartContainer.style.marginBottom = "8vh";
      chartContainer.innerHTML = `
          <h4>Promedio de productos distribuidos - Categoría: ${categoria}</h4>
          <div class="d-flex align-items-center mb-3">
            <label for="selectAno-${categoria}" class="me-2">Filtrar por Año - ${categoria}: </label>
            <select id="selectAno-${categoria}" class="form-select form-select-sm w-auto">
              <option value="all">Todos los años</option>
            </select>
          </div>
          <canvas id="chart-${categoria}"></canvas>
        `;
      contenedor.appendChild(chartContainer);

      // Filtrar datos por categoría
      const datosCategoria = data.filter(
        (item) => item.categoria === categoria
      );
      const fechas = datosCategoria.map((item) => item.fecha.split(" ")[0]);
      const cantidades = datosCategoria.map((item) => item.cantidad);

      // Obtenemos los años únicos para cada categoría
      const anosUnicos = [
        ...new Set(fechas.map((fecha) => fecha.split("-")[0])),
      ];

      // Llenar el select de años con los valores únicos de la categoría
      const selectAno = document.getElementById(`selectAno-${categoria}`);
      anosUnicos.forEach((ano) => {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
      });

      // Crear el gráfico para esta categoría
      new Chart(document.getElementById(`chart-${categoria}`), {
        type: "line",
        data: {
          labels: fechas,
          datasets: [
            {
              label: `Promedio - Categoría: ${categoria}`,
              data: cantidades,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: `Promedio - Categoría: ${categoria}`,
              font: { size: 18 },
            },
          },
          scales: {
            x: { title: { display: true, text: "Fecha" } },
            y: { title: { display: true, text: "Cantidad Promedio" } },
          },
        },
      });

      // Filtrar por año dentro de cada gráfico
      selectAno.addEventListener("change", (e) => {
        const anoSeleccionado = e.target.value;
        const fechasFiltradas =
          anoSeleccionado === "all"
            ? fechas
            : fechas.filter((fecha) => fecha.startsWith(anoSeleccionado));
        const cantidadesFiltradas =
          anoSeleccionado === "all"
            ? cantidades
            : cantidades.filter((_, index) =>
                fechas[index].startsWith(anoSeleccionado)
              );

        // Actualizar el gráfico con los nuevos datos filtrados
        const chart = Chart.getChart(`chart-${categoria}`); // Obtener la instancia del gráfico
        chart.data.labels = fechasFiltradas;
        chart.data.datasets[0].data = cantidadesFiltradas;
        chart.update();
      });
    });

    // Filtro general de grupo para todos los gráficos
    const selectGrupo = document.getElementById("selectGrupo");
    selectGrupo.addEventListener("change", (e) => {
      const grupoSeleccionado = e.target.value;

      // Filtrar gráficos por grupo
      categorias.forEach((categoria) => {
        const chartContainer = document.querySelector(
          `#chart-${categoria}`
        ).parentElement;
        if (grupoSeleccionado === "all" || grupoSeleccionado === categoria) {
          chartContainer.style.display = "block"; // Mostrar el gráfico
        } else {
          chartContainer.style.display = "none"; // Ocultar el gráfico
        }
      });
    });
  }

  function generarGraficosRealVsPredicted(data) {
    const valoresReales = data.map((item) => item.Actual);
    const valoresPredichos = data.map((item) => item.Predicted);

    // Gráfico de dispersión
    new Chart(document.getElementById("scatterChart"), {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Predicciones",
            data: valoresReales.map((x, i) => ({ x, y: valoresPredichos[i] })),
            backgroundColor: "rgba(75, 192, 192, 1)",
          },
          {
            label: "Valores Históricos",
            data: [
              { x: Math.min(...valoresReales), y: Math.min(...valoresReales) },
              { x: Math.max(...valoresReales), y: Math.max(...valoresReales) },
            ],
            borderColor: "rgba(255, 99, 132, 1)",
            type: "line",
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: "Valores Históricos vs Predicciones (Dispersión)",
            font: { size: 18 },
          },
        },
        scales: {
          x: { title: { display: true, text: "Valores Históricos" } },
          y: { title: { display: true, text: "Predicciones" } },
        },
      },
    });

    // Gráfico de líneas
    new Chart(document.getElementById("lineChart"), {
      type: "line",
      data: {
        labels: Array.from({ length: valoresReales.length }, (_, i) => i + 1),
        datasets: [
          {
            label: "Valores Históricos",
            data: valoresReales,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            fill: false,
          },
          {
            label: "Predicciones",
            data: valoresPredichos,
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: "Comparación de Valores Históricos y Predicciones (Líneas)",
            font: { size: 18 },
          },
        },
        scales: {
          x: { title: { display: true, text: "Índice" } },
          y: { title: { display: true, text: "Cantidad" } },
        },
      },
    });
  }

  //Gráficos de optimización
  function createLineChart(canvasId, chartData, color) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    // Ordenar los valores de x y sus valores correspondientes de y
    const sortedData = chartData.x_values
      .map((x, index) => ({ x: x, y: chartData.y_values[index] }))
      .sort((a, b) => a.x - b.x); // Asegúrate de que x sea numérico; ajusta si es string.

    const sortedX = sortedData.map((item) => item.x);
    const sortedY = sortedData.map((item) => item.y);

    // Crear un degradado para el fondo
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(255,255,255,0.1)");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: sortedX.map(String),
        datasets: [
          {
            label: chartData.y_label,
            data: sortedY,
            borderColor: color,
            backgroundColor: gradient,
            borderWidth: 2,
            pointBackgroundColor: color,
            pointBorderColor: color,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: chartData.title,
            font: { size: 18 },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: chartData.x_label,
            },
          },
          y: {
            title: {
              display: true,
              text: chartData.y_label,
            },
            beginAtZero: false,
          },
        },
        elements: {
          point: {
            radius: 5,
            hoverRadius: 7,
          },
        },
      },
    });
  }
  fetch("json/distribucion/hyperparameter_results.json")
    .then((response) => response.json())
    .then((data) => {
      // Color palette
      const colors = {
        xgboost: "rgba(255, 99, 132, 0.7)",
        catboost: "rgba(54, 162, 235, 0.7)",
        svr: "rgba(255, 206, 86, 0.7)",
      };

      // XGBoost Charts
      createLineChart(
        "xgboost_n_estimators",
        data.xgboost.n_estimators,
        colors.xgboost
      );
      createLineChart(
        "xgboost_max_depth",
        data.xgboost.max_depth,
        colors.xgboost
      );
      createLineChart(
        "xgboost_learning_rate",
        data.xgboost.learning_rate,
        colors.xgboost
      );

      // CatBoost Charts
      createLineChart(
        "catboost_iterations",
        data.catboost.iterations,
        colors.catboost
      );
      createLineChart("catboost_depth", data.catboost.depth, colors.catboost);
      createLineChart(
        "catboost_learning_rate",
        data.catboost.learning_rate,
        colors.catboost
      );

      // SVR Charts
      createLineChart("svr_c", data.svr.C, colors.svr);
      createLineChart("svr_gamma", data.svr.gamma, colors.svr);
    })
    .catch((error) => console.error("Error loading the JSON:", error));

  //Gráficos de métricas
  fetch("json/distribucion/metrics.json")
    .then((response) => response.json())
    .then((data) => {
      // Datos para los modelos base
      const baseMetrics = data.model_metrics;
      const baseLabels = Object.keys(baseMetrics); // Nombres de los modelos
      const metrics = Object.keys(baseMetrics[baseLabels[0]]); // Tipos de métricas

      // Generar gráficos para cada métrica
      metrics.forEach((metric) => {
        // Crear un canvas dinámicamente para cada gráfico
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 200;
        document.getElementById("baseModelsContainer").appendChild(canvas);

        // Obtener los valores de cada modelo para esta métrica
        const values = baseLabels.map((model) => baseMetrics[model][metric]);

        // Crear el gráfico
        new Chart(canvas, {
          type: "bar",
          data: {
            labels: baseLabels,
            datasets: [
              {
                label: metric,
                data: values,
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Métrica: ${metric}`,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      });

      // Datos para el meta-modelo
      const metaMetrics = data.meta_metrics;
      const metaLabels = Object.keys(metaMetrics);
      const metaValues = metaLabels.map((metric) => metaMetrics[metric]);

      // Crear el gráfico del meta-modelo
      new Chart(document.getElementById("metaModelChart"), {
        type: "bar",
        data: {
          labels: metaLabels,
          datasets: [
            {
              label: "Meta-modelo",
              data: metaValues,
              backgroundColor: "rgba(255, 99, 132, 0.7)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Métricas del Meta-modelo",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    });

  //Gráfico de Predicciones para 2024
  fetch("json/distribucion/data_historica_predicciones.json")
    .then((response) => response.json())
    .then((data) => {
      const ctx = document.getElementById("predictionChart").getContext("2d");

      // Última fecha de los datos históricos
      const lastHistoricalDate = new Date(
        Math.max(...data.historical.fecha.map((date) => new Date(date)))
      );

      // Filtrar predicciones que ocurran después de los históricos
      const filteredPredictions = data.predictions.fecha
        .map((fecha, index) => ({
          fecha: new Date(fecha),
          cantidad_predicha: data.predictions.cantidad_predicha[index],
        }))
        .filter((item) => item.fecha > lastHistoricalDate);

      // Configuración del gráfico
      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.historical.fecha.concat(
            filteredPredictions.map(
              (item) => item.fecha.toISOString().split("T")[0]
            )
          ), // Fechas combinadas
          datasets: [
            {
              label: "Datos Originales",
              data: data.historical.cantidad_real,
              borderColor: "blue",
              borderWidth: 2,
              fill: false,
              tension: 0.3,
            },
            {
              label: "Predicciones 2024",
              data: Array(data.historical.cantidad_real.length)
                .fill(null) // Espacios vacíos para mantener alineación
                .concat(
                  filteredPredictions.map((item) => item.cantidad_predicha)
                ),
              borderColor: "red",
              borderWidth: 2,
              borderDash: [5, 5],
              fill: false,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Datos Originales y Predicciones para 2024",
              font: { size: 18 },
            },
          },
          scales: {
            x: {
              type: "time", // Tipo de escala de tiempo
              time: {
                unit: "month", // Mostrar por meses
                tooltipFormat: "yyyy-MM-dd", // Formato en el tooltip
              },
              title: {
                display: true,
                text: "Fecha",
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
    })
    .catch((error) => console.error("Error al cargar el JSON:", error));

  //Gráfico de pie
  fetch("json/distribucion/division_data.json")
    .then((response) => response.json())
    .then((data) => {
      const ctx = document.getElementById("divisionChart").getContext("2d");

      const chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: data.division.labels,
          datasets: [
            {
              data: data.division.sizes,
              backgroundColor: ["skyblue", "lightgreen"],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Distribución de datos: Entrenamiento vs Prueba",
              font: { size: 18 },
            },
          },
        },
      });
    })
    .catch((error) =>
      console.error("Error al cargar el JSON para la distribución:", error)
    );
}
