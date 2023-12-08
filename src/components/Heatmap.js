import React, { useState, useEffect } from "react";
import "./Heatmap.css";
import "./external.css";
import * as d3 from "d3";
import { zoom as d3Zoom } from "d3-zoom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Heatmap = ({ displayedTransactions, currentYear }) => {
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    useEffect(() => {
        if (displayedTransactions) {
            renderHeatmap(displayedTransactions);
        }
    }, [displayedTransactions, currentYear]);

    const renderHeatmap = (transactions) => {
        // Remove previous zoom container if exists
        d3.select(".zoom-container").remove();

        // Setup container and dimensions
        const containerWidth = document.querySelector(".container").clientWidth;
        const margin = { top: 50, right: 0, bottom: 0, left: 50 };
        const width = containerWidth - margin.left - margin.right;
        const height = width;

        // SVG setup
        const svg = d3
            .select(".chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("class", "zoom-container")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Data processing
        const users = Array.from(
            new Set(transactions.map((t) => t.from).concat(transactions.map((t) => t.to)))
        );
        const userIndex = users.reduce((acc, user, i) => {
            acc[user] = i;
            return acc;
        }, {});

        const matrix = Array.from({ length: users.length }, () =>
            Array.from({ length: users.length }, () => 0)
        );

        transactions.forEach(({ from, to, amount }) => {
            matrix[userIndex[from]][userIndex[to]] += amount;
        });

        // Scales and color
        const xScale = d3.scaleBand().domain(users).range([0, width]).padding(0.05);
        const yScale = d3.scaleBand().domain(users).range([0, height]).padding(0.05);
        const colorScale = d3
            .scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([0, d3.max(matrix.flat())]);

        // Zoom behavior
        const zoomBehavior = d3Zoom()
            .scaleExtent([1, 10])
            .translateExtent([
                [0, 0],
                [width, height],
            ])
            .on("zoom", (event) => svg.attr("transform", event.transform));
        svg.call(zoomBehavior).on("dblclick.zoom", null);

        // Tooltip setup
        let tooltip = d3.select(".tooltip");
        if (tooltip.empty()) {
            tooltip = d3
                .select(".container")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
        }

        // Drawing cells
        svg.selectAll("rect")
            .data(matrix.flat())
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(users[i % users.length]))
            .attr("y", (d, i) => yScale(users[Math.floor(i / users.length)]))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", (d) => colorScale(d))
            .style("stroke", "black")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip
                    .html(formatTooltipContent(d, users, userIndex))
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

        // Axes
        svg.append("g")
            .call(d3.axisTop(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(yScale));

        // Helper function to format tooltip content
        function formatTooltipContent(data, users, userIndex) {
            const rowIndex = Math.floor(data / users.length);
            const colIndex = data % users.length;
            const fromUser = users[rowIndex];
            const toUser = users[colIndex];
            const amount = matrix[rowIndex][colIndex];
            return `From: ${fromUser}<br>To: ${toUser}<br>Amount: ${amount}`;
        }
    };

    // Function to handle toggling transaction visibility
    const toggleTransactionVisibility = () => {
        setShowTransactionHistory(!showTransactionHistory);
    };

    // Function to handle copying transactions to clipboard
    const copyTransactionsToClipboard = () => {
        const transactionString = selectedTransactions
            .map(
                (t) =>
                    `From: ${t.from}, To: ${t.to}, Amount: ${t.amount}, Timestamp: ${t.timestamp}`
            )
            .join("\n");
        navigator.clipboard
            .writeText(transactionString)
            .then(() => setCopySuccess("Transactions copied to clipboard!"))
            .catch((err) =>
                console.error("Error copying transactions to clipboard: ", err)
            );
    };

    return (
        <div className="parent">
            <div className="container">
                <svg className="chart"></svg>
            </div>
            <button onClick={toggleTransactionVisibility}>
                {showTransactionHistory ? "Hide Transactions" : "Preview Transactions"}
            </button>
            {copySuccess && <div className="copy-success">{copySuccess}</div>}
            {showTransactionHistory && (
                <div className="transaction-history">
                    <button onClick={copyTransactionsToClipboard} className="copy-button">
                        <i className="fas fa-clipboard"></i> Copy Transactions
                    </button>
                    {/* Existing table for transaction history */}
                    {/* ... */}
                </div>
            )}
        </div>
    );
};

export default Heatmap;
