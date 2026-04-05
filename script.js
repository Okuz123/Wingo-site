const BASE_API = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json";

let allData = [];
let currentPage = 1;
const perPage = 10;

// FETCH MULTIPLE PAGES (ACCURATE ORDER)
async function fetchData() {
    try {
        let temp = [];

        for (let i = 1; i <= 5; i++) {
            let res = await fetch(`${BASE_API}?pageNo=${i}&pageSize=10`);
            let json = await res.json();
            temp = temp.concat(json.data.list);
        }

        // Remove duplicates
        let map = {};
        temp.forEach(item => {
            map[item.issueNumber] = item;
        });

        allData = Object.values(map);

        // Sort latest first
        allData.sort((a, b) => Number(b.issueNumber) - Number(a.issueNumber));

        displayData();
        generateStats();
        generatePrediction();
        hotCold();

    } catch (e) {
        console.log("Error:", e);
    }
}

// COLOR
function getColor(num) {
    if (num == 0 || num == 5) return "violet";
    return num % 2 === 0 ? "red" : "green";
}

// DISPLAY TABLE
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

// PAGINATION
function nextPage() {
    if (currentPage < 50) {
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

// SEARCH
function searchData() {
    let input = document.getElementById("searchInput").value;
    let filtered = allData.filter(x => x.issueNumber.includes(input));

    let table = document.getElementById("tableBody");
    table.innerHTML = "";

    filtered.slice(0, 20).forEach(d => {
        table.innerHTML += `
        <tr>
            <td>${d.issueNumber}</td>
            <td class="${getColor(d.number)}">${d.number}</td>
            <td>${d.number >= 5 ? "Big" : "Small"}</td>
            <td class="${getColor(d.number)}">●</td>
        </tr>`;
    });
}

// STATS
function generateStats() {
    let last50 = allData.slice(0, 50);

    let big = last50.filter(x => x.number >= 5).length;
    let small = 50 - big;

    let even = last50.filter(x => x.number % 2 === 0).length;
    let odd = 50 - even;

    document.getElementById("statsBox").innerHTML = `
    📊 Last 50 Results<br><br>
    Big: ${big} | Small: ${small}<br>
    Even: ${even} | Odd: ${odd}
    `;
}

// PREDICTION
function generatePrediction() {
    let last20 = allData.slice(0, 20);

    let big = last20.filter(x => x.number >= 5).length;
    let small = 20 - big;

    document.getElementById("predictionBox").innerHTML =
        `Next Possibility: <b>${big > small ? "BIG" : "SMALL"}</b>`;
}

// HOT / COLD
function hotCold() {
    let freq = {};

    allData.slice(0, 100).forEach(d => {
        freq[d.number] = (freq[d.number] || 0) + 1;
    });

    let hot = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,3);
    let cold = Object.keys(freq).sort((a,b)=>freq[a]-freq[b]).slice(0,3);

    document.getElementById("predictionBox").innerHTML += `
    <br><br>🔥 Hot: ${hot.join(", ")}
    <br>❄ Cold: ${cold.join(", ")}
    `;
}

// PDF DOWNLOAD (FIXED)
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let y = 10;

    allData.forEach((d) => {
        doc.text(`${d.issueNumber} | ${d.number}`, 10, y);
        y += 7;

        if (y > 280) {
            doc.addPage();
            y = 10;
        }
    });

    doc.save("wingo_data.pdf");
}

// AUTO REFRESH
setInterval(fetchData, 5000);

// LOAD
fetchData();
