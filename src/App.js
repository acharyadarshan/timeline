import React, { useState, useEffect } from "react";
import axios from "axios";
import Heatmap from "./components/Heatmap";
import YearSlider from "./components/YearSlider";
import TimeSeriesChart from "./components/TimeSeriesChart"; // Import TimeSeriesChart component
import "../src/components/external.css";

function App() {
    const [transactionCount, setTransactionCount] = useState(500);
    const [currentYear, setCurrentYear] = useState(2018);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        axios
            .get(
                "https://raw.githubusercontent.com/boluwarinayinmode/Utxo-JS/main/database/transformed_data2.json"
            )
            .then((response) => {
                if (response.data.status === "OK") {
                    setTransactions(response.data.data.transactions);
                } else {
                    console.error("Data not OK", response.data);
                }
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const handleYearChange = (year) => {
        setCurrentYear(year);
        // Update the transaction count based on the year
        const newTransactionCount = calculateTransactionCount(year);
        setTransactionCount(newTransactionCount);
    };

    const calculateTransactionCount = (year) => {
        // Define your logic for calculating transaction count based on year
        const baseYear = 2018;
        const baseTransactionCount = 1000;
        const transactionIncrementPerYear = 2000;
        const increment = (year - baseYear) * transactionIncrementPerYear;
        return baseTransactionCount + increment;
    };

    // Filter transactions based on the transaction count
    const displayedTransactions = transactions.slice(0, transactionCount);

    return (
        <div className="body">
            {/* ... other components ... */}
            <YearSlider minYear={2018} maxYear={2023} onYearChange={handleYearChange} />
            <Heatmap
                transactions={displayedTransactions}
                transactionCount={transactionCount}
                currentYear={currentYear}
            />
            <TimeSeriesChart
                transactions={displayedTransactions}
                transactionCount={transactionCount}
            />
        </div>
    );
}

export default App;
