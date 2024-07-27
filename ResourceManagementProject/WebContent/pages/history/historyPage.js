let jsonAll = [];
//페이지 로드되면 바로 데이터 불러오게 하기.
window.onload = fetchData;

// 입출고내역 데이터 가져오기
async function fetchData() {
  try {
    const response = await fetch("history.json"); // JSON 파일 경로
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    jsonAll = [...data];
    console.log(jsonAll);
    createTable(data);
  } catch (error) {
    console.error("Fetch error: ", error);
  }
}

// 테이블에 데이터 추가
function createTable(data) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = ""; // 기존 내용 지우기

  data.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <input type="checkbox" />
      </td>      
      <td>${item.category}</td>
      <td>${item.barcode}</td>
      <td>${item.itemName}</td>
      <td>${item.modelName}</td>
      <td>${item.manufacturer}</td>
      <td>${item.specification}</td>
      <td>${item.processingDate}</td>
      <td>
        <button type="button" onclick="alert('클릭!')">
          <img class="deleteImg" src="./static/deleteImg.jpg" />
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// 페이지 로드 시 데이터 가져오기
document.addEventListener("DOMContentLoaded", fetchData);

// 날짜 버튼 선택 시 dateStart 값 변경

/* 집가서 더 만들기*/

// historyPage.js

document.addEventListener("DOMContentLoaded", function () {
  const data = [
    // 예제 데이터
    {
      rack: "WH01-0",
      itemName: "Item 1",
      modelName: "Model 1",
      manufacturer: "Manufacturer 1",
      usage: "Company A",
      date: "2024-07-01",
      specification: "BOX",
      quantity: 12,
    },
    {
      rack: "WH01-1",
      itemName: "Item 2",
      modelName: "Model 2",
      manufacturer: "Manufacturer 2",
      usage: "Company B",
      date: "2024-07-05",
      specification: "EA",
      quantity: 34,
    },
    // ... 나머지 데이터
  ];

  // 날짜 버튼 선택 시 dateStart 값 변경
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

  // 검색 버튼 클릭 시 데이터 필터링
  document.querySelector(".search").addEventListener("click", () => {
    const selectInput = document.getElementById("selectInput").value;
    const searchType = document.querySelector(
      'input[name="searchType"]:checked'
    ).value;
    const searchBar = document.getElementById("searchBar").value.toLowerCase();
    const dateStartValue = new Date(document.getElementById("dateStart").value);
    const dateEndValue = new Date(document.getElementById("dateEnd").value);

    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.date);
      const searchMatch = item[searchType].toLowerCase().includes(searchBar);

      return (
        itemDate >= dateStartValue &&
        itemDate <= dateEndValue &&
        searchMatch &&
        item.rack.includes(selectInput)
      );
    });

    populateTable(filteredData);
  });

  function populateTable(data) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    data.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td>${index + 1}</td>
              <td><input type="checkbox" /></td>
              <td>${item.rack}</td>
              <td>${item.itemName}</td>
              <td>${item.modelName}</td>
              <td>${item.manufacturer}</td>
              <td>${item.usage}</td>
              <td>${item.date}</td>
              <td>${item.specification}</td>
              <td><button type="button" onclick="alert('클릭!')"><img class="deleteImg" src="./static/deleteImg.jpg" /></button></td>
          `;
      tableBody.appendChild(row);
    });
  }

  // 초기 데이터 테이블 채우기
  populateTable(data);
});