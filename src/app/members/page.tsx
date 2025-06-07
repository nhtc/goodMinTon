"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import MemberForm from "../../components/MemberForm"

interface Member {
  id: string
  name: string
  email?: string
  phone?: string
  createdAt: string
}

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/members")
      if (!response.ok) throw new Error("Failed to fetch members")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleMemberUpdate = async () => {
    await fetchMembers()
    setShowForm(false)
  }

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa thành viên "${name}" không?`)) {
      try {
        setDeleteLoading(id)
        const response = await fetch(`/api/members/${id}`, { method: "DELETE" })
        if (!response.ok) throw new Error("Failed to delete member")
        await fetchMembers()
      } catch (error) {
        console.error("Error deleting member:", error)
        alert("Có lỗi xảy ra khi xóa thành viên!")
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  // Filter members based on search term
  const filteredMembers = members.filter(
    member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email &&
        member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.phone && member.phone.includes(searchTerm))
  )

  return (
    <div className='min-h-screen members-page-bg'>
      {/* Enhanced Header */}
      <div className='members-header'>
        <div className='container mx-auto px-6 py-8'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className='flex items-center space-x-4'>
              <div>
                <h1 className='header-title'>Quản lý Thành viên</h1>
                <p className='header-subtitle'>
                  Tổ chức và theo dõi các thành viên câu lạc bộ cầu lông
                </p>
              </div>
            </div>
            <div className='header-actions'>
              <Link href='/' className='btn btn-outline'>
                <span>🏠</span>
                <span>Trang chủ</span>
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
              >
                <span>{showForm ? "❌" : "➕"}</span>
                <span>{showForm ? "Đóng form" : "Thêm thành viên"}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='stats-grid'>
            <div className='stat-card'>
              <div className='stat-icon'>👥</div>
              <div className='stat-content'>
                <div className='stat-number'>{members.length}</div>
                <div className='stat-label'>Tổng thành viên</div>
              </div>
            </div>
            <div className='stat-card'>
              <div className='stat-icon'>📅</div>
              <div className='stat-content'>
                <div className='stat-number'>
                  {
                    members.filter(m => {
                      const joinDate = new Date(m.createdAt)
                      const now = new Date()
                      const diffTime = Math.abs(
                        now.getTime() - joinDate.getTime()
                      )
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      )
                      return diffDays <= 30
                    }).length
                  }
                </div>
                <div className='stat-label'>Thành viên mới (30 ngày)</div>
              </div>
            </div>
            <div className='stat-card'>
              <div className='stat-icon'>📱</div>
              <div className='stat-content'>
                <div className='stat-number'>
                  {members.filter(m => m.phone).length}
                </div>
                <div className='stat-label'>Có số điện thoại</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-6 py-8'>
        {/* Collapsible Member Form */}
        <div
          className={`form-container ${showForm ? "form-open" : "form-closed"}`}
        >
          <MemberForm onUpdate={handleMemberUpdate} />
        </div>

        {/* Search and Filter Section */}
        <div className='search-section'>
          <div className='search-container'>
            <div className='search-icon'>🔍</div>
            <input
              type='text'
              placeholder='Tìm kiếm thành viên theo tên, email hoặc số điện thoại...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='search-input'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className='search-clear'
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <div className='search-results'>
              Tìm thấy <strong>{filteredMembers.length}</strong> thành viên
            </div>
          )}
        </div>

        {/* Members List */}
        <div className='members-list-container'>
          <div className='list-header'>
            <h2 className='list-title'>
              <span className='mr-3'>📋</span>
              Danh sách Thành viên
            </h2>
            <div className='member-count-badge'>
              {filteredMembers.length} / {members.length}
            </div>
          </div>

          {loading ? (
            <div className='loading-state'>
              <div className='loading-spinner'></div>
              <h3>Đang tải danh sách thành viên...</h3>
              <p>Vui lòng đợi trong giây lát</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className='empty-state'>
              <div className='empty-icon'>{searchTerm ? "🔍" : "👤"}</div>
              <h3 className='empty-title'>
                {searchTerm
                  ? "Không tìm thấy thành viên nào"
                  : "Chưa có thành viên nào"}
              </h3>
              <p className='empty-description'>
                {searchTerm
                  ? `Không có thành viên nào phù hợp với từ khóa "${searchTerm}"`
                  : "Hãy thêm thành viên đầu tiên cho câu lạc bộ của bạn!"}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className='empty-action-btn'
                >
                  <span>🔄</span>
                  <span>Xóa bộ lọc</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className='empty-action-btn'
                >
                  <span>➕</span>
                  <span>Thêm thành viên đầu tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div className='members-grid'>
              {filteredMembers.map((member, index) => (
                <div
                  key={member.id}
                  className='member-card'
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Member Avatar */}
                  <div className='member-avatar'>
                    <div className='avatar-circle'>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className='member-status online'></div>
                  </div>

                  {/* Member Info */}
                  <div className='member-info'>
                    <h3 className='member-name'>{member.name}</h3>

                    <div className='member-details'>
                      {member.email && (
                        <div className='detail-item'>
                          <span className='detail-icon'>📧</span>
                          <span className='detail-text'>{member.email}</span>
                        </div>
                      )}

                      {member.phone && (
                        <div className='detail-item'>
                          <span className='detail-icon'>📱</span>
                          <span className='detail-text'>{member.phone}</span>
                        </div>
                      )}

                      <div className='detail-item'>
                        <span className='detail-icon'>📅</span>
                        <span className='detail-text'>
                          Tham gia:{" "}
                          {new Date(member.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Member Actions */}
                  <div className='member-actions'>
                    <div className='action-buttons'>
                      <button
                        onClick={() =>
                          handleDeleteMember(member.id, member.name)
                        }
                        disabled={deleteLoading === member.id}
                        className='action-btn delete-btn'
                        title='Xóa thành viên'
                      >
                        {deleteLoading === member.id ? (
                          <div className='mini-spinner'></div>
                        ) : (
                          <span>🗑️</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Member Badge */}
                  <div className='member-badge'>
                    {(() => {
                      const joinDate = new Date(member.createdAt)
                      const now = new Date()
                      const diffTime = Math.abs(
                        now.getTime() - joinDate.getTime()
                      )
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      )

                      if (diffDays <= 7)
                        return <span className='badge new'>Mới</span>
                      if (diffDays <= 30)
                        return <span className='badge recent'>Gần đây</span>
                      return <span className='badge regular'>Thành viên</span>
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MembersPage
