"use client"
import React, { useEffect, useState, lazy, Suspense } from "react"
import Link from "next/link"
import styles from "./page.module.css"
import Modal from "../../components/Modal"
import {
  AuthorizedComponent,
  EditableContent,
  usePermissions,
} from "../../components/AuthorizedComponent"

// Lazy load heavy components for better performance
const MemberForm = lazy(() => import("../../components/MemberForm"))

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
  const [showModal, setShowModal] = useState(false)
  const { canEdit, userRole } = usePermissions()

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
    setShowModal(false)
  }

  const handleMemberSubmit = async (
    memberData: Omit<Member, "id" | "createdAt">
  ) => {
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        throw new Error("Failed to create member")
      }

      await fetchMembers() // Refresh the members list
    } catch (error) {
      console.error("Error creating member:", error)
      throw error // Re-throw to let the form handle the error
    }
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
    <AuthorizedComponent>
      <div className={`min-h-screen ${styles.membersPageBg}`}>
        {/* Enhanced Header */}
        <div className={styles.membersHeader}>
          <div className='container mx-auto px-6 py-8'>
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div className='flex items-center space-x-4'>
                <div>
                  <h1 className={styles.headerTitle}>Quản lý Thành viên</h1>
                  <p className={styles.headerSubtitle}>
                    Tổ chức và theo dõi các thành viên câu lạc bộ cầu lông
                  </p>
                </div>
              </div>
              <div className={styles["header-actions"]}>
                <Link href='/' className='btn btn-outline'>
                  <span>🏠</span>
                  <span>Trang chủ</span>
                </Link>

                {/* Permission Indicator */}
                <div
                  className={`${styles["permission-badge"]} ${styles[userRole]}`}
                >
                  <span>
                    {userRole === "admin"
                      ? "👑"
                      : userRole === "editor"
                      ? "✏️"
                      : "👁️"}
                  </span>
                  <span>{userRole}</span>
                </div>

                {/* Add Member Button - Show Modal */}
                {canEdit ? (
                  <button
                    onClick={() => setShowModal(true)}
                    className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-cyan-500 text-white font-medium rounded-lg hover:from-green-500 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'
                  >
                    <span>👤</span>
                    <span>Thêm thành viên mới</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (userRole === "guest") {
                        alert("Vui lòng đăng nhập để thêm thành viên")
                        window.location.href = "/login"
                      } else {
                        alert(
                          "Bạn không có quyền thêm thành viên. Liên hệ quản trị viên để được cấp quyền."
                        )
                      }
                    }}
                    className='btn btn-primary'
                  >
                    <span>➕</span>
                    <span>Thêm thành viên</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles["stats-grid"]}>
            <div className={styles["stat-card"]}>
              <div className={styles["stat-icon"]}>👥</div>
              <div className={styles["stat-content"]}>
                <div className={styles["stat-number"]}>{members.length}</div>
                <div className={styles["stat-label"]}>Tổng thành viên</div>
              </div>
            </div>
            <div className={styles["stat-card"]}>
              <div className={styles["stat-icon"]}>📅</div>
              <div className={styles["stat-content"]}>
                <div className={styles["stat-number"]}>
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
                <div className={styles["stat-label"]}>
                  Thành viên mới (30 ngày)
                </div>
              </div>
            </div>
            <div className={styles["stat-card"]}>
              <div className={styles["stat-icon"]}>📱</div>
              <div className={styles["stat-content"]}>
                <div className={styles["stat-number"]}>
                  {members.filter(m => m.phone).length}
                </div>
                <div className={styles["stat-label"]}>Có số điện thoại</div>
              </div>
            </div>
          </div>
        </div>

        <div className='container mx-auto px-6 py-8'>
          {/* Search and Filter Section */}
          <div className={styles["search-section"]}>
            <div className={styles["search-container"]}>
              <div className={styles["search-icon"]}>🔍</div>
              <input
                type='text'
                placeholder='Tìm kiếm thành viên theo tên, email hoặc số điện thoại...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={styles["search-input"]}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={styles["search-clear"]}
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <div className={styles["search-results"]}>
                Tìm thấy <strong>{filteredMembers.length}</strong> thành viên
              </div>
            )}
          </div>

          {/* Members List */}
          <div className={styles.membersListContainer}>
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>
                <span className='mr-3'>📋</span>
                Danh sách Thành viên
              </h2>
              <div className={styles.memberCountBadge}>
                {filteredMembers.length} / {members.length}
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <h3>Đang tải danh sách thành viên...</h3>
                <p>Vui lòng đợi trong giây lát</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  {searchTerm ? "🔍" : "👤"}
                </div>
                <h3 className={styles.emptyTitle}>
                  {searchTerm
                    ? "Không tìm thấy thành viên nào"
                    : "Chưa có thành viên nào"}
                </h3>
                <p className={styles.emptyDescription}>
                  {searchTerm
                    ? `Không có thành viên nào phù hợp với từ khóa "${searchTerm}"`
                    : "Hãy thêm thành viên đầu tiên cho câu lạc bộ của bạn!"}
                </p>
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={styles.emptyActionBtn}
                  >
                    <span>🔄</span>
                    <span>Xóa bộ lọc</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (canEdit) {
                        setShowModal(true)
                      } else {
                        // Redirect to login for guests or show permission error for authenticated users
                        if (userRole === "guest") {
                          alert("Vui lòng đăng nhập để thêm thành viên")
                          window.location.href = "/login"
                        } else {
                          alert(
                            "Bạn không có quyền thêm thành viên. Liên hệ quản trị viên để được cấp quyền."
                          )
                        }
                      }
                    }}
                    className={styles.emptyActionBtn}
                  >
                    <span>➕</span>
                    <span>Thêm thành viên đầu tiên</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.membersGrid}>
                {filteredMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={`${styles.memberCard} ${styles.memberCardAnimated}`}
                  >
                    {/* Member Avatar */}
                    <div className={styles.memberAvatar}>
                      <div className={styles.avatarCircle}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`${styles.memberStatus} ${styles.online}`}
                      ></div>
                    </div>

                    {/* Member Info */}
                    <div className={styles.memberInfo}>
                      <h3 className={styles.memberName}>{member.name}</h3>

                      <div className={styles.memberDetails}>
                        {member.email && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailIcon}>📧</span>
                            <span className={styles.detailText}>
                              {member.email}
                            </span>
                          </div>
                        )}

                        {member.phone && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailIcon}>📱</span>
                            <span className={styles.detailText}>
                              {member.phone}
                            </span>
                          </div>
                        )}

                        <div className={styles.detailItem}>
                          <span className={styles.detailIcon}>📅</span>
                          <span className={styles.detailText}>
                            Tham gia:{" "}
                            {new Date(member.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member Actions - Edit Only */}
                    <div className={styles.memberActions}>
                      <EditableContent
                        viewContent={
                          <div className={styles.viewOnlyActions}>
                            <span className={styles.viewOnlyText}>
                              👁️ Chỉ xem
                            </span>
                          </div>
                        }
                      >
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() =>
                              handleDeleteMember(member.id, member.name)
                            }
                            disabled={deleteLoading === member.id}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title='Xóa thành viên'
                          >
                            {deleteLoading === member.id ? (
                              <div className={styles.miniSpinner}></div>
                            ) : (
                              <span>🗑️</span>
                            )}
                          </button>
                        </div>
                      </EditableContent>
                    </div>

                    {/* Member Badge */}
                    <div className={styles.memberBadge}>
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
                          return (
                            <span className={`${styles.badge} ${styles.new}`}>
                              Mới
                            </span>
                          )
                        if (diffDays <= 30)
                          return (
                            <span
                              className={`${styles.badge} ${styles.recent}`}
                            >
                              Gần đây
                            </span>
                          )
                        return (
                          <span className={`${styles.badge} ${styles.regular}`}>
                            Thành viên
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal for Member Form */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <Suspense
            fallback={
              <div className={styles.loadingFallback}>Đang tải form...</div>
            }
          >
            <MemberForm onUpdate={handleMemberUpdate} />
          </Suspense>
        </Modal>
      </div>
    </AuthorizedComponent>
  )
}

export default MembersPage
