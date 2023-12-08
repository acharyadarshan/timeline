import React, { useMemo } from "react";
import "./external.css";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const TimeSeriesChart = ({ transactions }) => {
    // Preprocess transactions for time series chart
    const dataForChart = useMemo(() => {
        const aggregateByDate = {};

        transactions.forEach((transaction) => {
            const date = new Date(transaction.timestamp).toLocaleDateString();
            if (!aggregateByDate[date]) {
                aggregateByDate[date] = { date, amount: 0 };
            }
            aggregateByDate[date].amount += transaction.amount;
        });

        return Object.values(aggregateByDate);
    }, [transactions]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataForChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default TimeSeriesChart;
