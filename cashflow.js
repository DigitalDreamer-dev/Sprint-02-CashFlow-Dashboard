let salary=0; 
let expenses=[]; 
let chart;
let currentCurrency = "INR";

const form = document.getElementById("expenseForm"); 
const salaryInput = document.getElementById("salary");
const expenseAmountInput = document.getElementById("expenseAmount");

const error = document.getElementById("error");

const salaryDisplay = document.getElementById("salaryDisplay"); 
const expenseDisplay = document.getElementById("expenseDisplay"); 
const balanceDisplay = document.getElementById("balanceDisplay"); 

const expenseList = document.getElementById("expenseList"); 


const downloadBtn = document.getElementById("downloadPdf"); 
const expenseNameInput = document.getElementById("expenseName"); 
const chartCanvas = document.getElementById("expenseChart");
const warningMessage = document.getElementById("warningMessage");
const currencySelect = document.getElementById("currency");
form.addEventListener("submit", addExpense);
downloadBtn.addEventListener("click", downloadPDF);
currencySelect.addEventListener("change", convertCurrency);


function addExpense(event){ event.preventDefault(); 
const salaryValue = Number(salaryInput.value); 
const expenseName = expenseNameInput.value.trim(); 

const expenseAmount = Number(expenseAmountInput.value); 
    if( 
        salaryValue<=0||expenseName===""||expenseAmount<=0 ){
             error.textContent = "Please enter valid Input."; 
             return; 
            } 
            error.textContent=""; 
            salary = salaryValue;

             expenses.push({ 
                id:Date.now(),
                name: expenseName, amount: expenseAmount 

             });

             renderExpenses();
              updateSummary(); 
              saveData();
              updateChart();
               expenseNameInput.value = "";
                expenseAmountInput.value = ""; 
            } 
            function renderExpenses(rate = 1, symbol = "₹"){ 
                expenseList.innerHTML = ""; 
                expenses.forEach(function(expense) {
                     const li = document.createElement("li"); 
                     li.textContent = `${expense.name} - ${symbol}${(expense.amount * rate).toFixed(2)}`;
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                     deleteBtn.addEventListener("click", function () {
                     deleteExpense(expense.id);
                    });
                    
                    
                     li.appendChild(deleteBtn);
                    expenseList.appendChild(li);

                  });
 
                }
 
function updateSummary(rate = 1, symbol="₹"){
    let totalExpenses = 0;
    expenses.forEach(function(expense){
       totalExpenses += expense.amount;
    });
    const remainingBalance = salary - totalExpenses;
     salaryDisplay.textContent = `${symbol}${(salary * rate).toFixed(2)}`;
     expenseDisplay.textContent = `${symbol}${(totalExpenses * rate).toFixed(2)}`;
     balanceDisplay.textContent = `${symbol}${(remainingBalance * rate).toFixed(2)}`;
    
    if (remainingBalance <= salary * 0.10) {

    balanceDisplay.classList.add("danger");
    balanceDisplay.classList.remove("safe");

    warningMessage.textContent =
        "⚠︎ Warning! Your remaining balance is below 10% of your salary.";

} else {

    // balanceDisplay.style.color = "green";
    balanceDisplay.classList.remove("danger");
    balanceDisplay.classList.add("safe");
    warningMessage.textContent = "";
}

}
   
  function updateChart(rate = 1) {

    let totalExpenses = 0;

    expenses.forEach(function(expense) {
        totalExpenses += expense.amount;
    });

    const remainingBalance = salary - totalExpenses;

    if (chart) {
        chart.destroy();
    }
    chart = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: ["Remaining Balance", "Total Expenses"],
            datasets: [{
                data: [
                    (remainingBalance * rate).toFixed(2),
                    (totalExpenses * rate).toFixed(2)
                ],
                backgroundColor:[
                    "#4CAF50",
                    "#F44336"
                ],
                borderColor: [
                    "#ffffff",
                    "#ffffff"
                ],
                borderWidth: 2
            }]
        },
           options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });

}
function saveData() {
    localStorage.setItem("salary", JSON.stringify(salary));
    localStorage.setItem("expenses", JSON.stringify(expenses));
}
function loadData() {

    const savedSalary = localStorage.getItem("salary");
    const savedExpenses = localStorage.getItem("expenses");

    if (savedSalary) {
        salary = JSON.parse(savedSalary);
    }

    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }

    renderExpenses();
    updateSummary();
    updateChart();
}
loadData();
function deleteExpense(id) {

    expenses = expenses.filter(function(expense) {
        return expense.id !== id;
    });
    renderExpenses();
    updateSummary();
    saveData();
    updateChart();
}
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Cash Flow Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Total Salary: Rs. ${salary}`, 20, 40);
    doc.text("Expenses:", 20, 60);

    let y = 70;
    expenses.forEach(function(expense) {
        doc.text(`${expense.name} - Rs. ${expense.amount}`, 20, y);
        y += 10;
    });

    let totalExpenses = 0;
    expenses.forEach(function(expense) {
        totalExpenses += expense.amount;
    });

    const remainingBalance = salary - totalExpenses;
    y += 10;
    doc.text(`Total Expenses: Rs. ${totalExpenses}`, 20, y);
    y += 10;
    doc.text(`Remaining Balance: Rs. ${remainingBalance}`, 20, y);
    doc.save("CashFlowReport.pdf");
}
async function convertCurrency() {

    currentCurrency = currencySelect.value;

    if (currentCurrency === "INR") {
         renderExpenses();
        updateSummary();
        updateChart();
        return;
    }

    try {

        const response = await fetch("https://open.er-api.com/v6/latest/INR");

        const data = await response.json();

        const rate = data.rates[currentCurrency];
        let symbol = "₹";

switch (currentCurrency) {
    case "USD":
        symbol = "$";
        break;

    case "EUR":
        symbol = "€";
        break;

    case "GBP":
        symbol = "£";
        break;

}
       updateSummary(rate, symbol);
       renderExpenses(rate, symbol);
       updateChart(rate);

    } catch (error) {

        console.log(error);

    }

}