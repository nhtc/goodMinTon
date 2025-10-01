"use client"
import React, { useEffect, useState, lazy, Suspense } from "react"
import Link from "next/link"
import styles from "./page.module.css"
import Modal from "../../components/Modal"
import ConfirmationModal from "../../components/ConfirmationModal"
import { Container, Section, PageHeader } from "../../components/Layout"
import { StatCard } from "../../components/Card"
import {
  AuthorizedComponent,
  EditableContent,
  usePermissions,
} from "../../components/AuthorizedComponent"
import { useToast } from "../../context/ToastContext"
import { useAlertActions } from "../../context/AlertContext"

// Lazy load heavy components for better performance
const MemberForm = lazy(() => import("../../components/MemberForm"))
const AvatarManager = lazy(() => import("../../components/AvatarManager"))

interface Member {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  isActive: boolean
  createdAt: string
}

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(true) // Show inactive members by default
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const [showAvatarManager, setShowAvatarManager] = useState(false)
  const [memberToEditAvatar, setMemberToEditAvatar] = useState<Member | null>(null)
  const { canEdit, userRole } = usePermissions()
  const { showSuccess, showError, showWarning } = useToast()
  const { showConfirm } = useAlertActions()

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

  const handleMemberUpdate = async (updatedMember?: Member) => {
    if (!editingMember) {
      // Adding a new member - refetch to get the latest list
      await fetchMembers()
    } else if (updatedMember) {
      // Editing existing member - update local state to prevent flash
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === updatedMember.id 
            ? updatedMember
            : member
        )
      )
    }
    setShowModal(false)
    setEditingMember(null)
  }

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setShowModal(true)
  }

  const handleEditAvatar = (member: Member) => {
    setMemberToEditAvatar(member)
    setShowAvatarManager(true)
  }

  const handleAvatarUpdated = (updatedMember: Member) => {
    // Update the member in the local state
    setMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === updatedMember.id ? updatedMember : member
      )
    )
    // Close the modal after successful update with a short delay to show success message
    setTimeout(() => {
      setShowAvatarManager(false)
      setMemberToEditAvatar(null)
    }, 2000)
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

  const handleDeleteMember = (id: string, name: string) => {
    setMemberToDelete({ id, name })
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return

    try {
      setDeleteLoading(memberToDelete.id)
      const response = await fetch(`/api/members/${memberToDelete.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.gameCount) {
          // Member is in games, show error message
          showError(
            "Không thể xóa thành viên",
            `Không thể xóa ${memberToDelete.name}. ${data.message}`
          )
        } else {
          throw new Error(data.error || "Failed to delete member")
        }
        return
      }

      await fetchMembers()
      setShowDeleteConfirm(false)
      setMemberToDelete(null)
      showSuccess("Thành công", `Đã xóa thành viên ${memberToDelete.name}`)
    } catch (error) {
      console.error("Error deleting member:", error)
      showError("Lỗi", "Có lỗi xảy ra khi xóa thành viên!")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleToggleMemberStatus = async (id: string, name: string) => {
    try {
      setToggleLoading(id)
      
      // Optimistically update the UI first
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === id 
            ? { ...member, isActive: !member.isActive }
            : member
        )
      )

      const response = await fetch(`/api/members/${id}/toggle`, {
        method: "PATCH",
      })

      const data = await response.json()

      if (!response.ok) {
        // Revert the optimistic update on error
        setMembers(prevMembers => 
          prevMembers.map(member => 
            member.id === id 
              ? { ...member, isActive: !member.isActive }
              : member
          )
        )
        throw new Error(data.error || "Failed to toggle member status")
      }

      // Update with the actual data from server
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === id 
            ? { ...member, ...data.member }
            : member
        )
      )
    } catch (error) {
      console.error("Error toggling member status:", error)
      // Only show toast for actual errors
      showError("Lỗi", "Có lỗi xảy ra khi thay đổi trạng thái thành viên!")
    } finally {
      setToggleLoading(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setMemberToDelete(null)
  }

  // Filter members based on search term and active status
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email &&
        member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.phone && member.phone.includes(searchTerm))
    
    const matchesStatus = showInactive || member.isActive
    
    return matchesSearch && matchesStatus
  })

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
                    Tổ chức và theo dõi các thành viên câu lạc bộ cầu lông. 
                    Chỉ thành viên đang hoạt động mới được hiển thị khi tạo trận đấu.
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
                        showWarning("Yêu cầu đăng nhập", "Vui lòng đăng nhập để thêm thành viên")
                        setTimeout(() => {
                          window.location.href = "/login"
                        }, 2000)
                      } else {
                        showError(
                          "Không có quyền",
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
              <div className={styles["stat-icon"]}>✅</div>
              <div className={styles["stat-content"]}>
                <div className={styles["stat-number"]}>
                  {members.filter(m => m.isActive).length}
                </div>
                <div className={styles["stat-label"]}>Hoạt động</div>
              </div>
            </div>
            <div className={styles["stat-card"]}>
              <div className={styles["stat-icon"]}>⏸️</div>
              <div className={styles["stat-content"]}>
                <div className={styles["stat-number"]}>
                  {members.filter(m => !m.isActive).length}
                </div>
                <div className={styles["stat-label"]}>Tạm dừng</div>
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
            
            {/* Filter Options */}
            <div className={styles["filter-options"]}>
              <label className={styles["filter-label"]}>
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className={styles["filter-checkbox"]}
                />
                <span>Hiển thị thành viên tạm dừng</span>
              </label>
            </div>
            
            {(searchTerm || !showInactive) && (
              <div className={styles["search-results"]}>
                Hiển thị <strong>{filteredMembers.length}</strong> / {members.length} thành viên
                {!showInactive && " (chỉ đang hoạt động)"}
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
                          showWarning("Yêu cầu đăng nhập", "Vui lòng đăng nhập để thêm thành viên")
                          setTimeout(() => {
                            window.location.href = "/login"
                          }, 2000)
                        } else {
                          showError(
                            "Không có quyền",
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
                    className={`${styles.memberCard} ${styles.memberCardAnimated} ${
                      !member.isActive ? styles.inactiveMember : ""
                    }`}
                  >
                    {/* Member Avatar */}
                    <div className={styles.memberAvatar}>
                      <div className={styles.avatarCircle}>
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={`${member.name}'s avatar`}
                            className={styles.avatarImage}
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.currentTarget.classList.add(styles.avatarImageHidden);
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove(styles.avatarHidden);
                            }}
                          />
                        ) : null}
                        <div 
                          className={`${styles.avatarFallback} ${member.avatar ? styles.avatarHidden : styles.avatarVisible}`}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div
                        className={`${styles.memberStatus} ${
                          member.isActive ? styles.activeIndicator : styles.inactiveIndicator
                        }`}
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
                        
                        {/* Member Status */}
                        <div className={styles.detailItem}>
                          <span className={styles.detailIcon}>
                            {member.isActive ? "✅" : "❌"}
                          </span>
                          <span className={styles.detailText}>
                            Trạng thái:{" "}
                            <span
                              className={
                                member.isActive
                                  ? styles.activeStatus
                                  : styles.inactiveStatus
                              }
                            >
                              {member.isActive ? "Hoạt động" : "Tạm dừng"}
                            </span>
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
                            onClick={() => handleEditMember(member)}
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            title='Chỉnh sửa thành viên'
                          >
                            <span>✏️</span>
                          </button>
                          
                          <button
                            onClick={() => handleEditAvatar(member)}
                            className={`${styles.actionBtn} ${styles.avatarBtn}`}
                            title='Thay đổi ảnh đại diện'
                          >
                            <span>🖼️</span>
                          </button>
                          
                          <button
                            onClick={() =>
                              handleToggleMemberStatus(member.id, member.name)
                            }
                            disabled={toggleLoading === member.id}
                            className={`${styles.actionBtn} ${
                              member.isActive ? styles.deactivateBtn : styles.activateBtn
                            }`}
                            title={
                              member.isActive 
                                ? 'Tạm dừng thành viên' 
                                : 'Kích hoạt thành viên'
                            }
                          >
                            {toggleLoading === member.id ? (
                              <div className={styles.miniSpinner}></div>
                            ) : (
                              <span>{member.isActive ? "⏸️" : "▶️"}</span>
                            )}
                          </button>
                          
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
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingMember(null)
          }}
          showHeader={true}
          title={editingMember ? "Chỉnh Sửa Thành Viên" : "Thêm Thành Viên Mới"}
        >
          <Suspense
            fallback={
              <div className={styles.loadingFallback}>Đang tải form...</div>
            }
          >
            <MemberForm
              onUpdate={handleMemberUpdate}
              editingMember={editingMember}
            />
          </Suspense>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title='Xóa thành viên'
          message={
            memberToDelete
              ? `Bạn có chắc muốn xóa thành viên "${memberToDelete.name}" không? Hành động này không thể hoàn tác.`
              : ""
          }
          confirmText='Xóa thành viên'
          cancelText='Hủy bỏ'
          type='danger'
          isLoading={deleteLoading === memberToDelete?.id}
        />

        {/* Avatar Manager Modal */}
        <Modal
          isOpen={showAvatarManager}
          onClose={() => {
            setShowAvatarManager(false)
            setMemberToEditAvatar(null)
          }}
          showHeader={true}
          title={memberToEditAvatar ? `🎨 Update Avatar for ${memberToEditAvatar.name}` : "Avatar Manager"}
        >
          {memberToEditAvatar && (
            <Suspense
              fallback={
                <div className={styles.loadingFallback}>Đang tải avatar manager...</div>
              }
            >
              <AvatarManager
                member={memberToEditAvatar}
                onUpdate={handleAvatarUpdated}
              />
            </Suspense>
          )}
        </Modal>
      </div>
    </AuthorizedComponent>
  )
}

export default MembersPage
