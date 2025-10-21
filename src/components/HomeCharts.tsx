'use client'
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface MonthlyData {
  name: string
  games: number
  members: number
}

interface CategoryData {
  name: string
  value: number
}

interface HomeChartsProps {
  monthlyData: MonthlyData[]
  categoryData: CategoryData[]
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]

export default function HomeCharts({ monthlyData, categoryData }: HomeChartsProps) {
  return (
    <>
      {/* Monthly Activity Chart */}
      <div className="chartCard">
        <h3 className="chartTitle">📊 Hoạt động theo tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="games" fill="#3b82f6" name="Trận đấu" />
            <Bar dataKey="members" fill="#8b5cf6" name="Thành viên" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution Chart */}
      <div className="chartCard">
        <h3 className="chartTitle">📈 Phân bổ danh mục</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
