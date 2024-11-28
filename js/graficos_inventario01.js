function cargarInventario01(url) {
  $("#content").load(url, function () {
    inicializarGraficosI01();
  });
}

function inicializarGraficosI01() {
  const categorias = ["Grupo1", "Grupo2", "Grupo3", "Grupo4"]; 
  const graficosContainer = document.getElementById("graficosContainer");

  // Función para cargar los datos JSON y graficar
  categorias.forEach((categoria) => {
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
                label: `Valores Reales - ${categoria}`,
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
                text: `Comparación de Predicciones vs Valores Reales - ${categoria}`,
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

  // Lista de categorías y archivos JSON generados previamente
  const categorias2 = ["Grupo1", "Grupo2", "Grupo3", "Grupo4"]; 
  const graficosContainer2 = document.getElementById("graficosContainer2");

  // Función para cargar los datos JSON y graficar
  categorias2.forEach((categoria) => {
    const filePath = `json/inventario01/historicosypredicciones/${categoria}_data.json`; 

    fetch(filePath)
      .then((response) => response.json())
      .then((data) => {
        const canvas = document.createElement("canvas");
        canvas.style.marginBottom = "8vh";
        graficosContainer2.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        // Reducir los datos históricos aún más, solo tomar uno de cada 20 datos
        const numDatosHistoricos = 150; // Número de puntos históricos a mostrar
        const step = Math.floor(
          data.historico.fechas.length / numDatosHistoricos
        );
        const datosHistoricosReducidos = data.historico.fechas.filter(
          (_, index) => index % step === 0
        );
        const valoresHistoricosReducidos = data.historico.valores.filter(
          (_, index) => index % step === 0
        );

        // Crear el gráfico
        new Chart(ctx, {
          type: "line",
          data: {
            labels: [...datosHistoricosReducidos, ...data.predicciones.fechas],
            datasets: [
              {
                label: `Históricos - ${categoria}`,
                data: valoresHistoricosReducidos,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.4,
                fill: true,
              },
              {
                label: `Predicción - ${categoria}`,
                data: Array(datosHistoricosReducidos.length)
                  .fill(null)
                  .concat(data.predicciones.valores), 
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
                text: `Histórico y Predicciones 2024 para ${categoria}`,
                font: { size: 18 },
              },
            },
            scales: {
              x: { title: { display: true, text: "Fecha" } },
              y: { title: { display: true, text: "Cantidad" } },
            },
          },
        });
      })
      .catch((error) =>
        console.error(`Error al cargar el JSON de ${categoria}:`, error)
      );
  });
}
