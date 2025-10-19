import React from "react"
import ReactDatePicker, { registerLocale } from "react-datepicker"
import { vi } from "date-fns/locale"
import "react-datepicker/dist/react-datepicker.css"
import styles from "./DatePicker.module.css"

// Register Vietnamese locale
registerLocale("vi", vi)

interface DatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  maxDate?: Date
  minDate?: Date
  placeholder?: string
  className?: string
  hasError?: boolean
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  maxDate,
  minDate,
  placeholder = "Chọn ngày...",
  className = "",
  hasError = false,
}) => {
  return (
    <div className={`${styles.datePickerWrapper} ${hasError ? styles.error : ""}`}>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        maxDate={maxDate}
        minDate={minDate}
        dateFormat="dd/MM/yyyy"
        locale="vi"
        placeholderText={placeholder}
        className={`${styles.datePicker} ${className}`}
        calendarClassName={styles.calendar}
        wrapperClassName={styles.datePickerInputWrapper}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperClassName={styles.popper}
        popperPlacement="bottom-start"
        autoComplete="off"
      />
      <div className={styles.dateIcon}>📅</div>
    </div>
  )
}

export default DatePicker
