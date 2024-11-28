function cargarInventario01(url) {
  $("#content").load(url, function () {
    inicializarGraficosI01();
  });
}

function inicializarGraficosI01() {
  const categorias = ["Grupo1", "Grupo2", "Grupo3", "Grupo4"]; // Actualizar con los nombres reales
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


}
