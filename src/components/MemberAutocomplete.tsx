"use client"
import React, { useState, useEffect, useRef } from 'react'
import * as Select from '@radix-ui/react-select'
import * as Popover from '@radix-ui/react-popover'
import styles from './MemberAutocomplete.module.css'

interface Member {
  id: string
  name: string
  phone?: string
  avatar?: string
  createdAt: string
  isActive?: boolean
}

interface MemberAutocompleteProps {
  members: Member[]
  selectedMember: Member | null
  onMemberChange: (member: Member | null) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
}

const MemberAutocomplete: React.FC<MemberAutocompleteProps> = ({
  members,
  selectedMember,
  onMemberChange,
  placeholder = "Tìm và chọn thành viên...",
  disabled = false,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(members)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members)
    } else {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMembers(filtered)
    }
    setHighlightedIndex(-1)
  }, [searchQuery, members])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredMembers[highlightedIndex]) {
          handleMemberSelect(filteredMembers[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleMemberSelect = (member: Member) => {
    onMemberChange(member)
    setSearchQuery(member.name)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleClear = () => {
    onMemberChange(null)
    setSearchQuery("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsOpen(true)
    
    // Clear selection if user starts typing new query
    if (selectedMember && value !== selectedMember.name) {
      onMemberChange(null)
    }
  }

  // Set initial search query if member is selected
  useEffect(() => {
    if (selectedMember && !searchQuery) {
      setSearchQuery(selectedMember.name)
    } else if (!selectedMember && searchQuery) {
      setSearchQuery("")
    }
  }, [selectedMember])

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className={styles.autocompleteContainer}>
        <Popover.Trigger asChild>
          <div className={`${styles.inputContainer} ${disabled ? styles.disabled : ''}`}>
            <div className={styles.searchIcon}>🔍</div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={styles.input}
              autoComplete="off"
            />
            {isLoading && (
              <div className={styles.loadingSpinner}></div>
            )}
            {selectedMember && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className={styles.clearButton}
                disabled={disabled}
                title="Xóa lựa chọn"
              >
                ✕
              </button>
            )}
            <div className={styles.dropdownIcon}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={isOpen ? styles.rotated : ''}
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={styles.dropdownContent}
            sideOffset={4}
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className={styles.dropdownHeader}>
              <div className={styles.resultCount}>
                {filteredMembers.length > 0 
                  ? `${filteredMembers.length} thành viên`
                  : 'Không tìm thấy thành viên nào'
                }
              </div>
            </div>
            
            {filteredMembers.length > 0 ? (
              <div className={styles.memberList}>
                {filteredMembers.map((member, index) => (
                  <button
                    key={member.id}
                    type="button"
                    className={`${styles.memberItem} ${
                      highlightedIndex === index ? styles.highlighted : ''
                    } ${selectedMember?.id === member.id ? styles.selected : ''}`}
                    onClick={() => handleMemberSelect(member)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className={styles.memberAvatar}>
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={`${member.name}'s avatar`}
                          className={styles.avatarImage}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className={`${styles.avatarFallback} ${!member.avatar ? styles.visible : styles.hidden}`}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>{member.name}</div>
                      {member.phone && (
                        <div className={styles.memberPhone}>📱 {member.phone}</div>
                      )}
                    </div>
                    {selectedMember?.id === member.id && (
                      <div className={styles.selectedIcon}>✓</div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🔍</div>
                <div className={styles.noResultsText}>
                  Không tìm thấy thành viên nào với từ khóa "{searchQuery}"
                </div>
                <div className={styles.noResultsHint}>
                  Thử tìm kiếm bằng tên hoặc số điện thoại
                </div>
              </div>
            )}

            {searchQuery && (
              <div className={styles.dropdownFooter}>
                <div className={styles.searchHint}>
                  <span className={styles.hintIcon}>💡</span>
                  Sử dụng phím ↑↓ để di chuyển, Enter để chọn
                </div>
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  )
}

export default MemberAutocomplete