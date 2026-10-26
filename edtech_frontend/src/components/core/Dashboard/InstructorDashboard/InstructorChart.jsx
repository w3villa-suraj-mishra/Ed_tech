import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {

  const [currChart, setCurrChart] = useState("students")

  const generateRandomColors = (numColors) => {
    const colors = []
    for (let i = 0; i < numColors; i++) {
      const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`
      colors.push(color)
    }
    return colors
  }

  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: generateRandomColors(courses.length),
        borderWidth: 2,
        borderColor: "#0F172A",
        hoverOffset: 20,
      },
    ],
  }

  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: generateRandomColors(courses.length),
        borderWidth: 2,
        borderColor: "#0F172A",
        hoverOffset: 20,
      },
    ],
  }

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#E2E8F0",
          font: {
            size: 12,
          },
        },
      },
    },
  }

  return (
    <div className="flex flex-1 flex-col gap-y-6 rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-richblack-5">
          📊 Analytics Overview
        </p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrChart("students")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            currChart === "students"
              ? "bg-yellow-400 text-black shadow-md scale-105"
              : "bg-richblack-700 text-yellow-300 hover:bg-richblack-600"
          }`}
        >
          👨‍🎓 Students
        </button>

        <button
          onClick={() => setCurrChart("income")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            currChart === "income"
              ? "bg-green-400 text-black shadow-md scale-105"
              : "bg-richblack-700 text-green-300 hover:bg-richblack-600"
          }`}
        >
          💰 Income
        </button>
      </div>

      {/* Chart */}
      <div className="relative h-[320px] w-full transition-all duration-300 hover:scale-[1.01]">
        <Pie
          data={currChart === "students" ? chartDataStudents : chartIncomeData}
          options={options}
        />
      </div>

    </div>
  )
}