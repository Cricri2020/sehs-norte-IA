function cargarAbastecimiento02(url) {
  $("#content").load(url, function () {
    inicializarGraficosA2();
  });
}

function inicializarGraficosA2() {
  // Generar gráfico general
  fetch("json/abastecimiento02/grafico_general.json")
    .then((response) => response.json())
    .then((data) => {
      const categorias = data.map((d) => d["Categoría"]);
      const predicciones = data.map((d) => d["Predicción Costo Promedio 2024"]);

      const ctx = document.getElementById("graficoGeneral").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: categorias,
          datasets: [
            {
              label: "Predicción Costo Promedio 2024",
              data: predicciones,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Predicción de Costo Promedio por Lote de envío para 2024",
              font: { size: 18 },
            },
          },
          scales: {
            x: { title: { display: true, text: "Categorías" } },
            y: { title: { display: true, text: "Costo Promedio" } },
          },
        },
      });
    })
    .catch((error) =>
      console.error("Error al cargar el JSON del gráfico general:", error)
    );

  // Generar gráficos individuales por categoría
  fetch("json/abastecimiento02/graficos_individuales.json")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("graficosIndividuales");
      const filterCategory = document.getElementById("filterCategory");

      // Crear una lista de categorías únicas
      const categorias = data.map((grafico) => grafico.Categoria);
      const categoriasUnicas = [...new Set(categorias)];

      // Agregar las categorías al select
      categoriasUnicas.forEach((categoria) => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        filterCategory.appendChild(option);
      });

      // Función para renderizar gráficos
      const renderGraficos = (filtro = "all") => {
        // Limpiar los gráficos existentes
        container.innerHTML = "";

        // Filtrar los datos si se aplica un filtro
        const datosFiltrados =
          filtro === "all"
            ? data
            : data.filter((grafico) => grafico.Categoria === filtro);

        // Generar los gráficos
        datosFiltrados.forEach((grafico) => {
          const canvas = document.createElement("canvas");
          canvas.style.marginBottom = "8vh";
          canvas.width = 800;
          canvas.height = 400;
          container.appendChild(canvas);

          const ctx = canvas.getContext("2d");

          const etiquetas = [
            ...grafico.Historicos.Año,
            ...grafico.Prediccion.Año.filter(
              (año) => !grafico.Historicos.Año.includes(año)
            ),
          ];

          const datosHistoricos = grafico.Historicos.Costo_Promedio;
          const datosPrediccion = [
            ...Array(grafico.Historicos.Costo_Promedio.length - 1).fill(null),
            grafico.Historicos.Costo_Promedio.at(-1),
            grafico.Prediccion.Costo_Promedio,
          ];

          new Chart(ctx, {
            type: "line",
            data: {
              labels: etiquetas,
              datasets: [
                {
                  label: `Históricos - ${grafico.Categoria}`,
                  data: datosHistoricos,
                  borderColor: "rgba(54, 162, 235, 1)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: `Predicción - ${grafico.Categoria}`,
                  data: datosPrediccion,
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
                  text: `Evolución de Costos - ${grafico.Categoria}`,
                  font: { size: 18 },
                },
              },
              scales: {
                x: { title: { display: true, text: "Año" } },
                y: { title: { display: true, text: "Costo Promedio" } },
              },
            },
          });
        });
      };

      // Renderizar todos los gráficos inicialmente
      renderGraficos();

      // Evento para filtrar gráficos al cambiar la categoría
      filterCategory.addEventListener("change", (event) => {
        const selectedCategory = event.target.value;
        renderGraficos(selectedCategory);
      });
    })
    .catch((error) =>
      console.error("Error al cargar el JSON de gráficos individuales:", error)
    );

  // Lista de categorías y archivos JSON generados previamente
  const categorias = ["Lote de envio 1", "Lote de envio 2", "Lote de envio 3", "Lote de envio 4"]; // Actualizar con los nombres reales
  const graficosContainer = document.getElementById("graficosContainer");
  const filterCategory2 = document.getElementById("filterCategory2");
  // Función para cargar las opciones del select dinámicamente
  function cargarOpcionesCategorias() {
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      filterCategory2.appendChild(option);
    });
  }

  // Función para cargar y graficar los datos según la categoría seleccionada
  function cargarGraficos(categoriaSeleccionada) {
    // Limpiar los gráficos existentes
    graficosContainer.innerHTML = "";

    categorias.forEach((categoria) => {
      // Filtrar según la categoría seleccionada
      if (
        categoriaSeleccionada !== "all" &&
        categoria !== categoriaSeleccionada
      ) {
        return;
      }

      const filePath = `json/abastecimiento02/json_data/${categoria}.json`;

      fetch(filePath)
        .then((response) => response.json())
        .then((data) => {
          const canvas = document.createElement("canvas");
          canvas.id = `chart-${categoria}`; // Cambiar el id del canvas según la categoría
          canvas.style.marginBottom = "8vh";
          graficosContainer.appendChild(canvas);

          const ctx = canvas.getContext("2d");

          new Chart(ctx, {
            type: "line",
            data: {
              labels: data.Historicos.Año,
              datasets: [
                {
                  label: `Históricos - ${data.Categoria}`,
                  data: data.Historicos.Costo_Promedio,
                  borderColor: "rgba(54, 162, 235, 1)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: `Predicción - ${data.Categoria}`,
                  data: data.Prediccion.Costo_Promedio,
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
                  text: `Comparación de Predicciones vs Valores Históricos - ${data.Categoria}`,
                  font: { size: 18 },
                },
              },
              scales: {
                x: { title: { display: true, text: "Año" } },
                y: { title: { display: true, text: "Costo Promedio" } },
              },
            },
          });
        })
        .catch((error) =>
          console.error(`Error al cargar el JSON de ${categoria}:`, error)
        );
    });
  }

  // Evento para filtrar gráficos según la categoría seleccionada
  filterCategory2.addEventListener("change", (event) => {
    const categoriaSeleccionada = event.target.value;
    cargarGraficos(categoriaSeleccionada);
  });

  // Inicialización
  cargarOpcionesCategorias(); // Cargar opciones en el select
  cargarGraficos("all"); // Mostrar todos los gráficos inicialmente
}
