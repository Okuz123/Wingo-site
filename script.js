const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageNo=1&pageSize=10";

let allData = JSON.parse(localStorage.getItem("wingoData")) || [];
let currentPage = 1;
const perPage = 10;
const maxPages = 50;

// 🔁 Fetch API
async function fetchData() {
    try {
        let res = await fetch(API_URL);
        let data = await res.json();

        let newList = data.data.list;

        newList.forEach(item => {
            // Avoid duplicates
            if (!allData.some(x => x.issueNumber === item.issueNumber)) {
                allData.push(item);
            }
        });

        // 🔥 SORT CORRECTLY (IMPORTANT FIX)
        allData.sort((a, b) => Number(b.issueNumber) - Number(a.issueNumber));

        // Keep only latest 500
        allData = allData.slice(0, 500);

        localStorage.setItem("wingoData", JSON.stringify(allData));

        displayData();

    } catch (e) {
        console.log("API Error:", e);
    }
}

// 🎨 Color Logic
function getColorClass(num) {
    if (num == 0 || num == 5) return "violet";
    return num % 2 === 0 ? "red" : "green";
}

// 📊 Display
function displayData() {
    let table = document.getElementById("tableBody");
    table.innerHTML = "";

    let start = (currentPage - 1) * perPage;
    let pageData = allData.slice(start, start + perPage);

    pageData.forEach(item => {
        let num = item.number;
        let colorClass = getColorClass(num);

        let row = `
        <tr class="row">
            <td>${item.issueNumber}</td>
            <td class="${colorClass}">${num}</td>
            <td>${num >= 5 ? "Big" : "Small"}</td>
            <td><span class="${colorClass}">●</span></td>
        </tr>
        `;

        table.innerHTML += row;
    });

    document.getElementById("pageNum").innerText = currentPage;
}

// Pagination
function nextPage() {
    if (currentPage < maxPages) {
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

// 📄 PDF
function downloadPDF() {
    let text = "Wingo Data\n\n";

    allData.forEach(d => {
        text += `${d.issueNumber} - ${d.number}\n`;
    });

    let blob = new Blob([text], { type: "application/pdf" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wingo_data.pdf";
    link.click();
}

// 🔁 Auto update
setInterval(fetchData, 5000);

// Load
fetchData();
displayData();
