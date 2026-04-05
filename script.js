const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageNo=1&pageSize=10";

let allData = JSON.parse(localStorage.getItem("wingoData")) || [];
let currentPage = 1;
const perPage = 10;

// 🔁 FETCH + FIX ORDER
async function fetchData() {
    let res = await fetch(API_URL);
    let json = await res.json();

    let newList = json.data.list;

    // merge without duplicates
    let map = {};
    [...allData, ...newList].forEach(item => {
        map[item.issueNumber] = item;
    });

    allData = Object.values(map);

    // 🔥 SORT PERFECTLY
    allData.sort((a, b) => Number(b.issueNumber) - Number(a.issueNumber));

    // keep latest 500
    allData = allData.slice(0, 500);

    localStorage.setItem("wingoData", JSON.stringify(allData));

    displayData();
    generatePrediction();
}

// 🎨 COLOR
function getColor(num) {
    if (num == 0 || num == 5) return "violet";
    return num % 2 === 0 ? "red" : "green";
}

// 📊 DISPLAY
function displayData() {
    let table = document.getElementById("tableBody");
    table.innerHTML = "";

    let start = (currentPage - 1) * perPage;
    let pageData = allData.slice(start, start + perPage);

    pageData.forEach(d => {
        table.innerHTML += `
        <tr>
            <td>${d.issueNumber}</td>
            <td class="${getColor(d.number)}">${d.number}</td>
            <td>${d.number >= 5 ? "Big" : "Small"}</td>
            <td class="${getColor(d.number)}">●</td>
        </tr>`;
    });

    document.getElementById("pageNum").innerText = currentPage;
}

// 🔮 SIMPLE PREDICTION
function generatePrediction() {
    let last10 = allData.slice(0, 10);

    let big = last10.filter(x => x.number >= 5).length;
    let small = 10 - big;

    let result = big > small ? "BIG" : "SMALL";

    document.getElementById("predictionBox").innerHTML =
        `Next Possibility: <b>${result}</b>`;
}

// 📄 REAL PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let y = 10;

    allData.forEach(d => {
        doc.text(`${d.issueNumber} - ${d.number}`, 10, y);
        y += 6;
    });

    doc.save("wingo.pdf");
}

// 📊 CHART (basic)
function drawChart() {
    let canvas = document.getElementById("chartCanvas");
    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let data = allData.slice(0, 20).map(x => x.number);

    data.forEach((val, i) => {
        ctx.fillRect(i * 15, 150 - val * 10, 10, val * 10);
    });
}

// 🔁 Tabs
function showTab(tab) {
    document.querySelectorAll(".tabContent").forEach(x => x.style.display = "none");
    document.getElementById(tab).style.display = "block";

    if (tab === "chart") drawChart();
}

// Pagination
function nextPage() { currentPage++; displayData(); }
function prevPage() { currentPage--; displayData(); }

// Auto refresh
setInterval(fetchData, 5000);

// Load
fetchData();
displayData();
