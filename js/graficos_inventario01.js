function cargarInventario01(url) {
  $("#content").load(url, function () {
    inicializarGraficosI01();
  });
}

function inicializarGraficosI01() {
  const categorias = ["Lote de envio 1", "Lote de envio 2", "Lote de envio 3", "Lote de envio 4"]; // Definir los grupos
  const graficosContainer = document.getElementById("graficosContainer");
  const filterCategory = document.getElementById("filterCategory");

  // Función para renderizar gráficos según el filtro seleccionado
  const renderGraficos = (filtro = "all") => {
    graficosContainer.innerHTML = ""; // Limpiar gráficos existentes

    const categoriasFiltradas =
      filtro === "all"
        ? categorias
        : categorias.filter((categoria) => categoria === filtro);

    categoriasFiltradas.forEach((categoria) => {
      const filePath = `json/inventario01/prediccionesvsreales/datos_${categoria}.json`;

      fetch(filePath)
        .then((response) => response.json())
        .then((data) => {
          const canvas = document.createElement("canvas");
          canvas.style.marginBottom = "8vh";
          graficosContainer.appendChild(canvas);

          const ctx = canvas.getContext("2d");

          new Chart(ctx, {
            type: "line",
            data: {
              labels: data.Años,
              datasets: [
                {
                  label: `Valores Históricos - ${categoria}`,
                  data: data.Valores_Reales,
                  borderColor: "blue",
                  fill: false,
                  tension: 0.4,
                },
                {
                  label: `Predicciones - ${categoria}`,
                  data: data.Predicciones,
                  borderColor: "orange",
                  borderDash: [5, 5],
                  fill: false,
                  tension: 0.4,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: true },
                title: {
                  display: true,
                  text: `Comparación de Predicciones vs Valores Históricos - ${categoria}`,
                  font: { size: 18 },
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
                    text: "Cantidad de Productos",
                  },
                },
              },
            },
          });
        })
        .catch((error) =>
          console.error(`Error cargando datos para ${categoria}:`, error)
        );
    });
  };

  // Función para cargar opciones en el filtro
  const cargarCategorias = () => {
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria; // Texto del grupo
      filterCategory.appendChild(option);
    });
  };

  // Inicializar la interfaz
  const init = () => {
    cargarCategorias(); // Cargar las opciones del filtro dinámicamente
    renderGraficos(); // Renderizar todos los gráficos por defecto

    // Evento para filtrar gráficos por categoría
    filterCategory.addEventListener("change", (event) => {
      const selectedCategory = event.target.value;
      renderGraficos(selectedCategory);
    });
  };

  // Llamar a la función de inicialización
  init();

  const graficosContainer2 = document.getElementById("graficosContainer2");
  const filterCategory2 = document.getElementById("filterCategory2");

  let charts2 = []; // Mantener referencia de gráficos activos

  const renderGraficos2 = (filtroCategoria = "all") => {
    graficosContainer2.innerHTML = ""; // Limpiar gráficos existentes
    charts2.forEach((chart) => chart.destroy()); // Destruir gráficos existentes
    charts2 = []; // Resetear referencia de gráficos

    const categoriasFiltradas =
      filtroCategoria === "all"
        ? categorias
        : categorias.filter((categoria) => categoria === filtroCategoria);

    categoriasFiltradas.forEach((categoria) => {
      const filePath = `json/inventario01/historicosypredicciones/${categoria}_data.json`;

      fetch(filePath)
        .then((response) => response.json())
        .then((data) => {
          const divGrafico = document.createElement("div");
          divGrafico.classList.add("mb-5");

          const labelFecha = document.createElement("label");
          labelFecha.textContent = `Filtrar Año - ${categoria}: `;
          labelFecha.classList.add("me-2");

          const selectAno = document.createElement("select");
          selectAno.classList.add(
            "form-select",
            "form-select-sm",
            "w-auto",
            "mb-3"
          );

          const numDatosHistoricos = 150;
          const step = Math.floor(
            data.historico.fechas.length / numDatosHistoricos
          );
          const fechasHistoricasReducidas = data.historico.fechas.filter(
            (_, index) => index % step === 0
          );
          const valoresHistoricosReducidos = data.historico.valores.filter(
            (_, index) => index % step === 0
          );

          const anosUnicos = [
            "all", // Opción para todos los años
            ...new Set([
              ...fechasHistoricasReducidas.map((fecha) => fecha.split("-")[0]),
              ...data.predicciones.fechas.map((fecha) => fecha.split("-")[0]),
            ]),
          ];

          anosUnicos.forEach((ano) => {
            const option = document.createElement("option");
            option.value = ano;
            option.textContent = ano === "all" ? "Todos los años" : ano;
            selectAno.appendChild(option);
          });

          const canvas = document.createElement("canvas");
          canvas.style.marginBottom = "8vh";

          divGrafico.appendChild(labelFecha);
          divGrafico.appendChild(selectAno);
          divGrafico.appendChild(canvas);
          graficosContainer2.appendChild(divGrafico);

          const ctx = canvas.getContext("2d");
          let chartInstance = null;

          const renderChart = (anoSeleccionado) => {
            if (chartInstance) chartInstance.destroy(); // Destruir gráfico previo

            let fechasFiltradasHistoricas = fechasHistoricasReducidas;
            let valoresFiltradosHistoricos = valoresHistoricosReducidos;
            let fechasFiltradasPredicciones = data.predicciones.fechas;
            let valoresFiltradosPredicciones = data.predicciones.valores;

            if (anoSeleccionado !== "all") {
              fechasFiltradasHistoricas = fechasHistoricasReducidas.filter(
                (fecha) => fecha.startsWith(anoSeleccionado)
              );
              valoresFiltradosHistoricos = valoresHistoricosReducidos.slice(
                0,
                fechasFiltradasHistoricas.length
              );

              fechasFiltradasPredicciones = data.predicciones.fechas.filter(
                (fecha) => fecha.startsWith(anoSeleccionado)
              );
              valoresFiltradosPredicciones = data.predicciones.valores.slice(
                0,
                fechasFiltradasPredicciones.length
              );
            }

            // Concatenar las fechas y valores para "Todos los años" (incluir predicciones de 2024)
            const fechasTotales =
              anoSeleccionado === "all"
                ? [...fechasFiltradasHistoricas, ...data.predicciones.fechas]
                : [
                    ...fechasFiltradasHistoricas,
                    ...fechasFiltradasPredicciones,
                  ];

            const valoresTotalesHistoricos =
              anoSeleccionado === "all"
                ? valoresFiltradosHistoricos
                : valoresFiltradosHistoricos;

            const valoresTotalesPredicciones =
              anoSeleccionado === "all"
                ? Array(valoresFiltradosHistoricos.length)
                    .fill(null)
                    .concat(data.predicciones.valores)
                : Array(valoresFiltradosHistoricos.length)
                    .fill(null)
                    .concat(valoresFiltradosPredicciones);

            chartInstance = new Chart(ctx, {
              type: "line",
              data: {
                labels: fechasTotales,
                datasets: [
                  {
                    label: `Históricos - ${categoria}`,
                    data: valoresTotalesHistoricos,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: `Predicción - ${categoria}`,
                    data: valoresTotalesPredicciones,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false,
                  },
                ],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: { display: true },
                  title: {
                    display: true,
                    text: `Histórico y Predicciones para ${categoria}${
                      anoSeleccionado !== "all"
                        ? ` - Año ${anoSeleccionado}`
                        : ""
                    }`,
                    font: { size: 18 },
                  },
                },
                scales: {
                  x: { title: { display: true, text: "Fecha" } },
                  y: { title: { display: true, text: "Cantidad" } },
                },
              },
            });

            charts2.push(chartInstance); // Guardar instancia del gráfico
          };

          renderChart("all");

          selectAno.addEventListener("change", () => {
            const anoSeleccionado = selectAno.value;
            renderChart(anoSeleccionado);
          });
        })
        .catch((error) =>
          console.error(`Error al cargar el JSON de ${categoria}:`, error)
        );
    });
  };

  const cargarCategorias2 = () => {
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      filterCategory2.appendChild(option);
    });
  };

  const init2 = () => {
    cargarCategorias2();
    renderGraficos2();

    filterCategory2.addEventListener("change", (event) => {
      const selectedCategory = event.target.value;
      renderGraficos2(selectedCategory);
    });
  };

  init2();
}
