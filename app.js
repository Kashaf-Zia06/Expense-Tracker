
// Selecting input fields
let name = document.querySelector("#first-input");
let category = document.querySelector("#sec-input");
let amount = document.querySelector("#third-input");
let date = document.querySelector("#fourth-input");

// Selecting buttons
let btn1 = document.querySelector("#ADD-btn");
let btn2 = document.querySelector("#REM-btn");
let btn3 = document.querySelector("#VIEW1-btn");
let btn4 = document.querySelector("#VIEW2-btn");

// Selecting modal elements
let modal = document.getElementById("expenseModal");
let modalTitle = document.getElementById("modalTitle");
let expenseList = document.getElementById("expenseList");
let ex = document.querySelector("#exp")
let cv = document.querySelector("#custom")

console.log(localStorage.getItem("expenses"));//debugging purpose

// Adding expense
btn1.addEventListener("click", (event) => {
    event.preventDefault(); // Prevents page refresh if inside a form

    // Validate inputs directly
    if (!name.value.trim() || isNaN(parseFloat(amount.value)) || !date.value) {
        alert("Please fill all fields correctly.");
        return;
    }

    // Convert input date (MM/DD/YY) to YYYY-MM-DD
    let inputDate = new Date(date.value);
    let formattedDate = inputDate.toISOString().split("T")[0]; // Converts to YYYY-MM-DD

    let expense = {
        expense_name: name.value.trim(),
        amount: parseFloat(amount.value),
        category: category.value,
        date: formattedDate
    };

    saveExpense(expense);

    // Clear input fields after saving
    name.value = "";
    amount.value = "";
    date.value = "";
});

function saveExpense(expense) {
    let storedExpenses = localStorage.getItem("expenses");
    let expensesArray = storedExpenses ? JSON.parse(storedExpenses) : [];

    expensesArray.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expensesArray));
    updateMonthlyTotal()
    alert("Expense saved successfully!");
}

// Remove Expense
btn2.addEventListener("click", () => {
    deleteExpense();
});

function deleteExpense() {
    let toBeDeleted = prompt("Enter expense name to be deleted: ");
    let storedExpenses = localStorage.getItem("expenses");
    let expensesArray = storedExpenses ? JSON.parse(storedExpenses) : [];

    let filteredArray = expensesArray.filter(
        (exp) => exp.expense_name.toLowerCase() !== toBeDeleted.toLowerCase()
    );

    localStorage.setItem("expenses", JSON.stringify(filteredArray));
    updateMonthlyTotal()
    alert("Expense Deleted Successfully");
}

// View Daily Expenses
btn3.addEventListener("click", () => {
    viewDailyExpenses()
    modal.classList.remove("hidden");
});

function viewDailyExpenses() {
    let today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD
    let storedExpenses = localStorage.getItem("expenses");
    let expensesArray = storedExpenses ? JSON.parse(storedExpenses) : [];

    console.log("Today's Date:", today);
    console.log("Stored Expenses:", expensesArray);

    let dailyExpenses = expensesArray.filter(exp => {
        console.log(`Checking Expense: ${exp.expense_name}, Date: ${exp.date}`);
        return exp.date === today;
    });

    console.log("Filtered Daily Expenses:", dailyExpenses);
    displayExpenses(dailyExpenses, "Daily");
}


// View Monthly Expenses
btn4.addEventListener("click", () => {
    viewMonthlyExpenses()
});

document.addEventListener("DOMContentLoaded", function () {


    // Hide modal when page loads
    modal.classList.add("hidden");

   
    document.querySelector(".close").addEventListener("click", () => {
        modal.classList.add("hidden");
    });

  
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});


function displayExpenses(expenses, type) {
  

    //SHOW MODAL ONLY WHEN BUTTON IS CLICKED
    modal.classList.remove("hidden");
    modal.style.display = "flex";


    let modalTitle = document.getElementById("modalTitle");
    let expenseList = document.getElementById("expenseList");

    modalTitle.innerHTML = `${type} Expenses`;
    expenseList.innerHTML = ""; // Clear previous content

    if (expenses.length === 0) {
        expenseList.innerHTML = "<p>No expenses found.</p>";
    } else {
        let categoryTotals = {};
        let totalAmount = 0;

        expenses.forEach(exp => {
            let category = exp.category;
            let amount = parseFloat(exp.amount);

            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += amount;
            totalAmount += amount;

            expenseList.innerHTML += `
                <div class="expense-item">
                <p><strong>${exp.expense_name}</strong> - $${amount} (${category}) on ${exp.date}</p>
                </div>
                `;
        });

        expenseList.innerHTML += `<h4>Total Expenses: $${totalAmount}</h4>`;
        expenseList.innerHTML += `<h4>Category Breakdown:</h4><ul>`;
        for (let category in categoryTotals) {
            expenseList.innerHTML += `<li>${category}: $${categoryTotals[category]}</li>`;
        }
        expenseList.innerHTML += `</ul>`;

        generateChart(categoryTotals);
    }
}



// 

document.querySelector(".close").addEventListener("click", () => {
    let modal = document.getElementById("expenseModal");
    modal.classList.add("hidden"); 
});

// Close modal when clicking outside it
window.addEventListener("click", (event) => {
    let modal = document.getElementById("expenseModal");
    if (event.target === modal) {
        modal.classList.add("hidden");
    }
});


function viewMonthlyExpenses() {
    modal.classList.remove("hidden");
    let currentMonth = new Date().toISOString().slice(0, 7); // Extract YYYY-MM
    let storedExpenses = localStorage.getItem("expenses");
    let expensesArray = storedExpenses ? JSON.parse(storedExpenses) : [];

    console.log("Current Month:", currentMonth);
    console.log("Stored Expenses:", expensesArray);

    let monthlyExpenses = expensesArray.filter(exp => {
        console.log(`Checking Expense: ${exp.expense_name}, Date: ${exp.date}`);
        return exp.date.startsWith(currentMonth);
    });

    console.log("Filtered Monthly Expenses:", monthlyExpenses);
    displayExpenses(monthlyExpenses, "Monthly");
}


// Close modal when clicking the "X" button
document.querySelector(".close").addEventListener("click", () => {
    modal.style.display = "none";
});



function generateChart(categoryTotals) {
    let ctx = document.getElementById("expenseChart").getContext("2d");

   // Ensure Chart.js exists before running
    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded!");
        return;
    }

    //  Destroy the previous chart if it exists
    if (window.expenseChart instanceof Chart) {
        window.expenseChart.destroy();
    }

    window.expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"]
            }]
        }
    });
}

exp.addEventListener("click", () => {
    exportToCSV()
})

function exportToCSV() {
    let storedExpenses = localStorage.getItem("expenses");
    let expensesArray = storedExpenses ? JSON.parse(storedExpenses) : [];

    if (expensesArray.length === 0) {
        alert("No expenses found to export!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Expense Name,Amount,Category,Date\n"; // CSV headers

    expensesArray.forEach(exp => {
        let row = `${exp.expense_name},${exp.amount},${exp.category},${exp.date}`;
        csvContent += row + "\n";
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

cv.addEventListener("click", () => {
    let custom_date = prompt("Enter date to view expense (YYYY-MM-DD)").trim(); // Trim spaces

    if (!custom_date) {
        alert("Please enter a valid date.");
        return;
    }

    let storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];

    let filteredExpenses = storedExpenses.filter(expense => String(expense.date).trim() === String(custom_date).trim());

    if (filteredExpenses.length === 0) {
        alert("No expenses found for this date.");
        return;
    }
    console.log("calling custom")
    displayChart(filteredExpenses, `Expenses for ${custom_date}`);
});

function displayChart(expenses, title) {
    let modal = document.getElementById("expenseModal");
    let chartContainer = document.getElementById("expenseChart");

    //  Ensure modal is visible before accessing elements inside it
    modal.classList.remove("hidden");
    modal.style.display = "flex";

    // Re-check if the chart exists
    chartContainer = document.getElementById("expenseChart");

    if (!chartContainer) {
        console.error("Error: Chart container not found!");
        return;
    }

    let labels = expenses.map(exp => exp.expense_name);
    let data = expenses.map(exp => exp.amount);

    let ctx = chartContainer.getContext("2d");

    ///  Destroy previous chart if it exists
    if (window.expenseChart instanceof Chart) {
        window.expenseChart.destroy();
    }

    // Create a new chart
    window.expenseChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: "rgba(117, 70, 205, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateMonthlyTotal() {
    let storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM

    let totalAmount = storedExpenses
        .filter(expense => expense.date.startsWith(currentMonth))
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    document.getElementById("monthlyTotal").innerText = `Total: $${totalAmount}`;
}
document.addEventListener("DOMContentLoaded", updateMonthlyTotal);
