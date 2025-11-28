// frontend/src/components/RevenueChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

const RevenueChart = ({ stats }) => {
  // Format monthly revenue data
  const monthlyData = stats?.monthlyRevenue || [];
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  
  // Khởi tạo mảng 12 tháng với giá trị 0
  const revenueByMonth = new Array(12).fill(0);
  
  // Fill data từ API
  monthlyData.forEach(item => {
    const monthIndex = item._id.month - 1; // Month bắt đầu từ 1
    revenueByMonth[monthIndex] = item.revenue / 1000000; // Convert to millions
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Doanh thu (Triệu VNĐ)',
        data: revenueByMonth,
        backgroundColor: 'rgba(244, 63, 94, 0.7)', // Rose color
        borderColor: 'rgba(244, 63, 94, 1)',
        borderWidth: 2,
        borderRadius: 4,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Doanh Thu Theo Tháng',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + ' Triệu VNĐ';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'M';
          },
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="w-full h-[400px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenueChart;