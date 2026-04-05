const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageNo=1&pageSize=10";

let allData = JSON.parse(localStorage.getItem("wingoData")) || [];
let currentPage = 1;
const perPage = 10;

// 🔁 Fetch API LIVE
async function fetchData() {
    try {
        let res = await fetch(API_URL);
        let data = await res.json();

        let newRecords = data.data.list;

        newRecords.forEach(item => {
            if (!allData.find(x => x.issueNumber === item.issueNumber)) {
                allData.unshift(item);
            }
        });

        // Keep max 500 records
        if (allData.length > 500) {
            allData = allData.slice(0, 500);
        }

        localStorage.setItem("wingoData", JSON.stringify(allData));
        displayData();

    } catch (err) {
        console.log("API Error:", err);
    }
}

// 📊 Show Data (Pagination)
function displayData() {
    let table = document.getElementById("tableBody");
    table.innerHTML = "";

    let start = (currentPage - 1) * perPage;
    let end = start + perPage;

    let pageData = allData.slice(start, end);

    pageData.forEach(item => {
        let row = `
        <tr>
            <td>${item.issueNumber}</td>
            <td>${item.number}</td>
            <td>${item.number >= 5 ? "Big" : "Small"}</td>
            <td>${item.number % 2 === 0 ? "🔴 Red" : "🟢 Green"}</td>
        </tr>`;
        table.innerHTML += row;
    });

    document.getElementById("pageNum").innerText = currentPage;
}

// ⏩ Next Page
function nextPage() {
    if (currentPage < 50) {
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

// 📄 Download PDF
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

// 🔁 Auto refresh every 5 sec
setInterval(fetchData, 5000);

// First load
fetchData();
displayData();