document.addEventListener("DOMContentLoaded", function () {
  fetch("../../../data/warehouse.json")
    .then((response) => response.json())
    .then((data) => {
      const uniqueData = removeDuplicates(data);
      warehouseData = uniqueData.map((warehouse) => {
        const currentLoad = Math.floor(Math.random() * (warehouse.maxLoad + 1));
        let status;
        if (currentLoad <= warehouse.maxLoad * 0.5) {
          status = "안전";
        } else if (currentLoad <= warehouse.maxLoad * 0.9) {
          status = "중간";
        } else {
          status = "위험";
        }
        return { ...warehouse, currentLoad, status };
      });
      filteredWarehouseData = [...warehouseData]; // 초기화 시 전체 데이터로 설정
      updateChartsAndStats(filteredWarehouseData); // 차트와 통계 업데이트
      populateTable(filteredWarehouseData); // 테이블 업데이트
    })
    .catch((error) => console.error("Error loading warehouse data:", error));
});

const subregions = {
  충청남도: ["공주시", "천안시", "아산시"],
  부산광역시: ["해운대구", "남구"],
  대구광역시: ["달서구", "수성구"],
  광주광역시: ["북구", "서구"],
  경기도: ["수원시", "성남시", "고양시"],
};

const regionNames = {
  충청남도: "충청남도",
  부산광역시: "부산광역시",
  대구광역시: "대구광역시",
  광주광역시: "광주광역시",
  경기도: "경기도",
};

let warehouseData = [];
let filteredWarehouseData = [];

function removeDuplicates(data) {
  const unique = {};
  data.forEach((item) => {
    unique[item.warehouseNumber] = item;
  });
  return Object.values(unique);
}

function updateSubregions() {
  const regionSelect = document.getElementById("regionSelect");
  const subregionSelect = document.getElementById("subregionSelect");
  selectedRegion = regionSelect.value;

  // Clear previous subregions
  subregionSelect.innerHTML = '<option value="">선택하세요</option>';

  // Populate new subregions
  if (subregions[selectedRegion]) {
    subregions[selectedRegion].forEach((subregion) => {
      const option = document.createElement("option");
      option.value = subregion;
      option.textContent = subregion;
      subregionSelect.appendChild(option);
    });
  }
}

function addBadge() {
  const regionSelect = document.getElementById("regionSelect");
  const subregionSelect = document.getElementById("subregionSelect");
  const badgeContainer = document.getElementById("badgeContainer");
  const selectedRegion = regionSelect.value;
  const selectedSubregion = subregionSelect.value;

  if (selectedRegion && selectedSubregion) {
    const badge = document.createElement("span");
    badge.className = "badge badge-primary";
    badge.textContent = `${regionNames[selectedRegion]} ${selectedSubregion}`;

    const removeBtn = document.createElement("span");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = "&times;";
    removeBtn.onclick = function () {
      badgeContainer.removeChild(badge);
      search(); // Remove badge and update the chart
    };

    badge.appendChild(removeBtn);
    badgeContainer.appendChild(badge);
    search(); // Add badge and update the chart
  }
}

function search() {
  const badges = document.querySelectorAll(".badge");
  const selectedSubregions = [];

  badges.forEach((badge) => {
    const text = badge.textContent.slice(0, -1); // Remove the '×' character
    selectedSubregions.push(text);
  });

  filteredWarehouseData = warehouseData.filter((warehouse) => {
    return selectedSubregions.some((subregion) =>
      warehouse.location.includes(subregion)
    );
  });

  updateChartsAndStats(filteredWarehouseData);
  populateTable(filteredWarehouseData);
}

function filterWarehouses() {
  const dangerChecked = document.getElementById("dangerBtn").checked;
  const middleChecked = document.getElementById("middleBtn").checked;
  const safeChecked = document.getElementById("safeBtn").checked;

  filteredWarehouseData = warehouseData.filter((warehouse) => {
    if (dangerChecked && warehouse.status === "위험") return true;
    if (middleChecked && warehouse.status === "중간") return true;
    if (safeChecked && warehouse.status === "안전") return true;
    return false;
  });

  updateChartsAndStats(
    filteredWarehouseData.length ? filteredWarehouseData : warehouseData
  );
  populateTable(
    filteredWarehouseData.length ? filteredWarehouseData : warehouseData
  );
}

let regionChart;
let categoryChart;
let statusChart;

function updateChartsAndStats(data) {
  updateRegionChart(data);
  updateCategoryChart(data);
  updateStatusChart(data);
  updateStats(data);
}

function updateRegionChart(data) {
  const ctx = document.getElementById("regionChart").getContext("2d");

  const regions = [
    "충청남도",
    "부산광역시",
    "대구광역시",
    "광주광역시",
    "경기도",
  ];
  const regionCounts = regions.map((region) => {
    return data.filter((warehouse) => warehouse.location.includes(region))
      .length;
  });

  if (regionChart) {
    regionChart.destroy();
  }

  regionChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: regions,
      datasets: [
        {
          label: "지역별 창고 수",
          data: regionCounts,
          backgroundColor: [
            "#8E44AD", // 보라색
            "#3498DB", // 파란색
            "#1ABC9C", // 청록색
            "#E67E22", // 주황색
            "#34495E", // 어두운 회색
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

function updateCategoryChart(data) {
  const ctx = document.getElementById("categoryChart").getContext("2d");

  const categories = ["상온", "냉장"];
  const categoryCounts = categories.map((category) => {
    return data.filter((warehouse) => warehouse.category === category).length;
  });

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          label: "카테고리별 창고 수",
          data: categoryCounts,
          backgroundColor: ["#FF7F50", "#1E90FF"],
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

function updateStatusChart(data) {
  const ctx = document.getElementById("statusChart").getContext("2d");

  const statuses = ["안전", "중간", "위험"];
  const statusCounts = statuses.map((status) => {
    return data.filter((warehouse) => warehouse.status === status).length;
  });

  if (statusChart) {
    statusChart.destroy();
  }

  statusChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: statuses,
      datasets: [
        {
          label: "적재량 상태별 창고 수",
          data: statusCounts,
          backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
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

function updateStats(data) {
  const totalWarehouseCount = data.length;
  const ambientWarehouseCount = data.filter(
    (warehouse) => warehouse.category === "상온"
  ).length;
  const coldWarehouseCount = data.filter(
    (warehouse) => warehouse.category === "냉장"
  ).length;

  document.getElementById("totalWarehouseCount").textContent =
    totalWarehouseCount;
  document.getElementById("ambientWarehouseCount").textContent =
    ambientWarehouseCount;
  document.getElementById("coldWarehouseCount").textContent =
    coldWarehouseCount;
}

function populateTable(data) {
  const tableBody = document.getElementById("warehouseTableBody");
  tableBody.innerHTML = "";
  data.forEach((warehouse) => {
    const row = document.createElement("tr");
    let statusClass = "";
    switch (warehouse.status) {
      case "안전":
        statusClass = "status-safe";
        break;
      case "중간":
        statusClass = "status-middle";
        break;
      case "위험":
        statusClass = "status-danger";
        break;
    }
    row.innerHTML = `
      <td>${warehouse.warehouseNumber}</td>
      <td>${warehouse.warehouseName}</td>
      <td>${warehouse.location}</td>
      <td>${warehouse.category}</td>
      <td>${warehouse.maxLoad}</td>
      <td>${warehouse.currentLoad}</td>
      <td class="${statusClass}">${warehouse.status}</td>
    `;
    tableBody.appendChild(row);
  });
}

function downloadReport() {
  const reportContent = document.querySelector(".content");
  const warehouseTableContainer = document.querySelector(
    ".warehouse-table-container"
  );
  const warehouseH2 = document.querySelector("#warehouseH2");

  // 창고 목록 테이블을 일시적으로 숨기기
  warehouseTableContainer.style.display = "none";
  warehouseH2.style.display = "none";

  html2canvas(reportContent).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("warehouse_report.pdf");

    // 창고 목록 테이블 다시 보이기
    warehouseTableContainer.style.display = "";
    warehouseH2.style.display = "";
  });

  const worksheet = XLSX.utils.json_to_sheet(filteredWarehouseData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "warehouse_report");
  XLSX.writeFile(workbook, "warehouse_report.xlsx");
}
