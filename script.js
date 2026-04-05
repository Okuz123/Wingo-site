// 🔗 CHANGE API HERE (30s / 1min / 3min / 5min)
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
            if (!allData.find(x => x.issueNumber === item.issueNumber)) {
                allData.unshift(item);
            }
        });

        // limit to 500
        if (allData.length > 500) {
            allData = allData.slice(0, 500);
        }

        localStorage.setItem("wingoData", JSON.stringify(allData));

        displayData();

    } catch (e) {
        console.log("Error:", e);
    }
}

// 🎨 Color Logic
function getColor(num) {
    if (num == 0 || num == 5) {
        return `<span class="violet">🟣 Violet</span>`;
    } else if (num % 2 === 0) {
        return `<span class="red">🔴 Red</span>`;
    } else {
        return `<span class="green">🟢 Green</span>`;
    }
}

// 📊 Show Data
function displayData() {
    let table = document.getElementById("tableBody");
    table.innerHTML = "";

    let start = (currentPage - 1) * perPage;
    let end = start + perPage;

    let pageData = allData.slice(start, end);

    pageData.forEach(item => {
        let num = item.number;

        let row = `
        <tr>
            <td>${item.issueNumber}</td>
            <td>${num}</td>
            <td>${num >= 5 ? "Big" : "Small"}</td>
            <td>${getColor(num)}</td>
        </tr>
        `;

        table.innerHTML += row;
    });

    document.getElementById("pageNum").innerText = currentPage;
}

// ⏩ Next Page
function nextPage() {
    if (currentPage < maxPages) {
        currentPage++;
        displayData();
    }
}

// ⏪ Prev Page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayData();
    }
}

// 📄 Download PDF (simple)
function downloadPDF() {
    let text = "Wingo History Data\n\n";

    allData.forEach(d => {
        text += `${d.issueNumber} - ${d.number}\n`;
    });

    let blob = new Blob([text], { type: "application/pdf" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wingo_data.pdf";
    link.click();
}

// 🔁 Auto update every 5 sec
setInterval(fetchData, 5000);

// First load
fetchData();
displayData();
