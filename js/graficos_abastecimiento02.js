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
              text: "Predicción de Costo Promedio por Categoría para 2024",
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

      data.forEach((grafico) => {
        const canvas = document.createElement("canvas");
        canvas.style.marginBottom = "8vh";
        canvas.width = 800;
        canvas.height = 400;
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        // Crear las etiquetas únicas
        const etiquetas = [
          ...grafico.Historicos.Año,
          ...grafico.Prediccion.Año.filter(
            (año) => !grafico.Historicos.Año.includes(año)
          ),
        ];

        const datosHistoricos = grafico.Historicos.Costo_Promedio;
        const datosPrediccion = [
          ...Array(grafico.Historicos.Costo_Promedio.length - 1).fill(null), // Espaciado hasta el último año histórico
          grafico.Historicos.Costo_Promedio.at(-1), // Último dato histórico
          grafico.Prediccion.Costo_Promedio, // Predicción para 2024
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
                borderColor: "rgba(255, 99, 132, 1)", // Línea roja
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderDash: [5, 5], // Línea punteada
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
              },
            },
            scales: {
              x: { title: { display: true, text: "Año" } },
              y: { title: { display: true, text: "Costo Promedio" } },
            },
          },
        });
      });
    })
    .catch((error) =>
      console.error("Error al cargar el JSON de gráficos individuales:", error)
    );

  // Lista de categorías y archivos JSON generados previamente
  const categorias = ["Grupo1", "Grupo2", "Grupo3", "Grupo4"]; // Actualizar con los nombres reales
  const graficosContainer = document.getElementById("graficosContainer");

  // Función para cargar los datos JSON y graficar
  categorias.forEach((categoria) => {
    const filePath = `json/abastecimiento02/json_data/${categoria}.json`;

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
                text: `Comparación de Predicciones vs Valores Reales - ${data.Categoria}`,
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
