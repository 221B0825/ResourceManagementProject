document.addEventListener("DOMContentLoaded", fetchData);

let rankingJson = [];
let saveAggregatedData = [];
/*-----------------입출고 순위 데이터 가져오기-----------*/
async function fetchData() {
  try {
    const response = await axios.get("ranking.json");

    rankingJson = response.data;

    //전체데이터 테이블에 업데이트
    const aggregatedData = countData(rankingJson);
    createTable(aggregatedData);
    saveAggregatedData = aggregatedData;
  } catch (error) {
    console.error("Fetch error가 발생했습니다.", error);
  }
}

// 데이터를 그룹화하여 수량을 합산하는 함수
function countData(data) {
  const count = data.reduce((acc, item) => {
    const key = item.modelName;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: item.quantity || 1 }; // 수량을 JSON 데이터에서 가져옴
    } else {
      acc[key].quantity += item.quantity || 1; // 수량을 누적
    }
    return acc;
  }, {});

  return Object.values(count);
}

// 테이블 채우기
function createTable(data) {
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = ""; // 기존 테이블 내용 삭제

  data.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.warehouseNumber}</td>
        <td>${item.itemName}</td>
        <td>${item.modelName}</td>
        <td>${item.manufacturer}</td>
        <td>${item.usage}</td>
        <td>${item.specification}</td>
        <td>${item.quantity}</td> <!-- 수량 추가 -->
      `;
    tableBody.appendChild(row);
  });
}

// 날짜 버튼 선택 시 dateStart, dateEnd 값 변경
const today = new Date();
const btnToday = document.getElementById("btnradio1");
const btnWeek = document.getElementById("btnradio2");
const btnMonth = document.getElementById("btnradio3");
const btnSixMonths = document.getElementById("btnradio4");
const dateStart = document.getElementById("dateStart");
const dateEnd = document.getElementById("dateEnd");

btnToday.addEventListener("click", () => {
  dateStart.valueAsDate = new Date(today);
  dateEnd.valueAsDate = new Date(today);
});

btnWeek.addEventListener("click", () => {
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  dateStart.valueAsDate = weekAgo;
  dateEnd.valueAsDate = new Date(today);
});

btnMonth.addEventListener("click", () => {
  const monthAgo = new Date(today);
  monthAgo.setMonth(today.getMonth() - 1);
  dateStart.valueAsDate = monthAgo;
  dateEnd.valueAsDate = new Date(today);
});

btnSixMonths.addEventListener("click", () => {
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  dateStart.valueAsDate = sixMonthsAgo;
  dateEnd.valueAsDate = new Date(today);
});

/*---------------------------검색 구현------------------*/
document.querySelector(".search").addEventListener("click", () => {
  const selectInput = document.getElementById("selectInput").value;
  const searchType = document.querySelector(
    'input[name="searchType"]:checked'
  ).value;
  const dateStartValue = new Date(document.getElementById("dateStart").value);
  const dateEndValue = new Date(document.getElementById("dateEnd").value);

  console.log("value : " + searchType);
  console.log("Start Date:", dateStartValue);
  console.log("End Date:", dateEndValue);

  var filteredData = rankingJson.filter((item) => {
    const itemDate = new Date(item.date);

    // console.log("Item Date:", itemDate);

    const specificationMatch =
      searchType === "total" ||
      (searchType === "valueBOX" && item.specification === "BOX") ||
      (searchType === "valueEA" && item.specification === "EA");

    return (
      (selectInput === "전체" || item.category === selectInput) &&
      itemDate >= dateStartValue &&
      itemDate <= dateEndValue &&
      specificationMatch
    );
  });

  console.log("Filtered Data:", filteredData);

  // 데이터 집계
  const aggregatedData = {};

  filteredData.forEach((item) => {
    const key = `${item.warehouseNumber}-${item.itemName}-${item.modelName}-${item.manufacturer}-${item.usage}-${item.specification}`;
    if (!aggregatedData[key]) {
      aggregatedData[key] = { ...item, quantity: 0 };
    }
    aggregatedData[key].quantity += item.quantity || 1;
  });

  const aggregatedArray = Object.values(aggregatedData);

  console.log("Aggregated Data:", aggregatedArray);

  // 테이블 업데이트
  createTable(aggregatedArray);
});

/*------------------------초기화 구현 완료------------------------*/
// 초기화 버튼 클릭 시 필터 초기화
document
  .querySelector(".button.btn-secondary")
  .addEventListener("click", () => {
    // 구분을 전체로 설정
    document.getElementById("selectInput").value = "입고";

    // 선택박스를 전체로 설정
    document.getElementById("total").checked = true;

    // 기간을 오늘로 설정
    const today = new Date();
    document.getElementById("dateStart").valueAsDate = today;
    document.getElementById("dateEnd").valueAsDate = today;

    // 기간선택 버튼 초기화
    document.getElementById("btnradio1").checked = true;

    console.log(rankingJson);
    // 전체 내역으로 다시 출력
    createTable(saveAggregatedData);

    // 안내하기
    swal(
      "기간별입출고 순위 초기화",
      "기간별입출고 순위 및 검색 조건을 초기화하였습니다.",
      "success"
    );
  });

// -------------------- charts ------------------------
// 상위 5개의 수량을 가진 항목을 가져오는 함수
function getTop5ItemsByQuantity() {
  // 테이블의 tbody에서 모든 행
  const rows = document.querySelectorAll("table tbody tr");

  // 데이터를 저장할 배열을 초기화
  const data = [];

  // 각 행에서 데이터를 추출합니다
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const quantity = parseInt(cells[7].innerText, 10); // quantity는 8번째 열 (0부터 시작하므로 인덱스 7)

    data.push({
      warehouseNumber: cells[1].innerText,
      itemName: cells[2].innerText,
      modelName: cells[3].innerText,
      manufacturer: cells[4].innerText,
      usage: cells[5].innerText,
      specification: cells[6].innerText,
      quantity: quantity,
    });
  });

  // quantity를 기준으로 내림차순 정렬
  data.sort((a, b) => b.quantity - a.quantity);

  // 상위 5개의 항목을 추출
  const top5Items = data.slice(0, 5);

  return top5Items;
}

// 전체 품목의 수량을 가져오는 함수
function getAllItems() {
  // 테이블의 tbody에서 모든 행을 가져옵니다
  const rows = document.querySelectorAll("table tbody tr");

  // 데이터를 저장할 배열을 초기화합니다
  const data = [];

  // 각 행에서 데이터를 추출합니다
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const quantity = parseInt(cells[7].innerText, 10); // quantity는 8번째 열 (0부터 시작하므로 인덱스 7)

    data.push({
      itemName: cells[2].innerText,
      quantity: quantity,
    });
  });

  return data;
}

// 페이지 로드 시 차트를 생성하고 렌더링하는 함수
window.onload = function () {
  // 상위 5개 항목 가져오기
  const top5Items = getTop5ItemsByQuantity();
  const dataPointsTop5 = top5Items.map((item) => ({
    y: item.quantity,
    label: item.itemName,
  }));

  // 전체 품목 가져오기
  const allItems = getAllItems();
  const dataPointsAllItems = allItems.map((item) => ({
    label: item.itemName, // x를 label로 변경
    y: item.quantity,
  }));
  console.log(dataPointsAllItems);

  // 상위 5개 항목 차트 생성
  var chartTop5 = new CanvasJS.Chart("chartContainer", {
    theme: "light2", // "light1", "light2", "dark1", "dark2"
    exportEnabled: true,
    animationEnabled: true,
    title: {
      text: "입출고 top 5",
    },
    data: [
      {
        type: "pie",
        startAngle: 25,
        toolTipContent: "<b>{label}</b>: {y}",
        showInLegend: "true",
        legendText: "{label}",
        indexLabelFontSize: 16,
        indexLabel: "{label} - {y}",
        dataPoints: dataPointsTop5,
      },
    ],
  });

  chartTop5.render();

  // 전체 품목 수량 차트 생성
  var chartAllItems = new CanvasJS.Chart("chartContainer2", {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "총 입출고 데이터",
    },
    axisY: {
      title: "Units",
      titleFontSize: 24,
      includeZero: true,
    },
    data: [
      {
        type: "column",
        yValueFormatString: "#,### Units",
        dataPoints: dataPointsAllItems,
      },
    ],
  });

  chartAllItems.render();
};
