const API = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageNo=1&pageSize=10";

let allData = JSON.parse(localStorage.getItem("wingoData")) || [];
let currentPage = 1;
const perPage = 10;

// FETCH NEW DATA (APPEND ONLY NEW)
async function fetchData() {
    let res = await fetch(API);
    let json = await res.json();
    let list = json.data.list;

    list.forEach(item => {
        // only add if not exists
        if (!allData.some(x => x.issueNumber === item.issueNumber)) {
            allData.unshift(item); // add to top
        }
    });

    // keep only 500
    allData = allData.slice(0, 500);

    localStorage.setItem("wingoData", JSON.stringify(allData));

    displayData();
    drawChart();
    prediction();
}

// DISPLAY TABLE
function displayData() {
    let table = document.getElementById("tableBody");
    table.innerHTML = "";

    let start = (currentPage - 1) * perPage;
    let data = allData.slice(start, start + perPage);

    data.forEach(d => {
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

// COLOR
function getColor(num) {
    if (num == 0 || num == 5) return "violet";
    return num % 2 === 0 ? "red" : "green";
}

// PAGINATION
function nextPage() {
    if ((currentPage * perPage) < allData.length) {
        currentPage++;
        displayData();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayData();
    }
}

// CHART
function drawChart() {
    let c = document.getElementById("chartCanvas");
    let ctx = c.getContext("2d");

    ctx.clearRect(0, 0, c.width, c.height);

    let last = allData.slice(0, 20);

    last.forEach((d, i) => {
        ctx.fillRect(i * 15, 200 - d.number * 15, 10, d.number * 15);
    });
}

// PREDICTION
function prediction() {
    let last = allData.slice(0, 20);

    let big = last.filter(x => x.number >= 5).length;
    let result = big > 10 ? "BIG" : "SMALL";

    document.getElementById("predictionBox").innerHTML =
        "Next: " + result;
}

// TABS FIX
function showTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
    document.getElementById(tab).style.display = "block";
}

// PDF FIX
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let y = 10;

    allData.forEach(d => {
        doc.text(`${d.issueNumber} - ${d.number}`, 10, y);
        y += 7;

        if (y > 280) {
            doc.addPage();
            y = 10;
        }
    });

    doc.save("wingo.pdf");
}

// MANUAL REFRESH
function manualRefresh() {
    fetchData();
}

// AUTO FETCH EVERY 30s
setInterval(fetchData, 30000);

// LOAD
displayData();
fetchData();
