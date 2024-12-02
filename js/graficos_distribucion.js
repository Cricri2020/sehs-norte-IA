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
}
