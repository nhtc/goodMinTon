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
import styles from '../app/page.module.css'

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
    <div className={styles.chartsGrid}>
      {/* Monthly Activity Chart */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>📊 Hoạt động theo tháng</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="games" fill="#3b82f6" name="Trận đấu" radius={[8, 8, 0, 0]} />
              <Bar dataKey="members" fill="#8b5cf6" name="Thành viên" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>📈 Phân bổ danh mục</h3>
        <div className={styles.chartContainer}>
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
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
