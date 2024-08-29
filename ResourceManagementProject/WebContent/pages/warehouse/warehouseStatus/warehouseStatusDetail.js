let warehouseData = []; // Load the warehouse data from the provided JSON
let filteredWarehouse = null;
let categoryChart; // 전역 변수로 차트 객체 선언

document.addEventListener("DOMContentLoaded", function () {
  fetch("../../../data/warehouseDetail.json")
    .then((response) => response.json())
    .then((data) => {
      warehouseData = data;
    })
    .catch((error) => console.error("Error loading warehouse data:", error));
});

function searchWarehouse() {
  const code = document
    .getElementById("searchWarehouseCode")
    .value.toUpperCase();

  filteredWarehouse = warehouseData.find(
    (warehouse) => warehouse.warehouseNumber === code
  );

  if (filteredWarehouse) {
    updateHeader(filteredWarehouse.warehouseName);
    updateCategoryChart(filteredWarehouse);
    populateMaterialTable(filteredWarehouse.materials);
  } else {
    alert("창고를 찾을 수 없습니다.");
  }
}

function updateCategoryChart(warehouse) {
  const ctx = document.getElementById("categoryChart").getContext("2d");

  const categories = [
    ...new Set(warehouse.materials.map((material) => material.category)),
  ];
  const categoryCounts = categories.map((category) => {
    return warehouse.materials
      .filter((material) => material.category === category)
      .reduce((sum, material) => sum + material.quantity, 0);
  });

  // 차트 객체가 이미 존재하는 경우 파괴
  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          label: "카테고리별 자재 수량",
          data: categoryCounts,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });
}

function populateMaterialTable(materials) {
  const tableHeader = document.querySelector("table thead");
  const tableBody = document.getElementById("materialTableBody");
  tableBody.innerHTML = "";
  materials.forEach((material) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${material.materialName}</td>
      <td>${material.category}</td>
      <td>${material.quantity}</td>
    `;
    tableBody.appendChild(row);
  });
  tableHeader.style.display = "table-header-group"; // 검색 후 테이블 헤더 표시
}

function updateHeader(tableName) {
  const tableHeader = document.getElementById("tableName");
  tableHeader.innerHTML = tableName;
}
