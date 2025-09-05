import React from 'react';
import { useToast } from '../context/ToastContext';
import { useAlertActions } from '../context/AlertContext';
import styles from './NotificationDemo.module.css';

const NotificationDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { showConfirm } = useAlertActions();

  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Thành công!', message: 'Thao tác đã được thực hiện thành công.' },
      error: { title: 'Lỗi!', message: 'Đã xảy ra lỗi khi thực hiện thao tác.' },
      warning: { title: 'Cảnh báo!', message: 'Vui lòng kiểm tra lại thông tin.' },
      info: { title: 'Thông tin!', message: 'Đây là thông báo thông tin quan trọng.' }
    };

    const { title, message } = messages[type];
    
    switch (type) {
      case 'success':
        showSuccess(title, message);
        break;
      case 'error':
        showError(title, message);
        break;
      case 'warning':
        showWarning(title, message);
        break;
      case 'info':
        showInfo(title, message);
        break;
    }
  };

  const handleConfirmDemo = () => {
    showConfirm(
      'Xác nhận thao tác',
      'Bạn có chắc chắn muốn thực hiện thao tác này không?',
      () => {
        showSuccess('Xác nhận', 'Bạn đã xác nhận thao tác thành công!');
      },
      () => {
        showInfo('Hủy bỏ', 'Thao tác đã được hủy bỏ.');
      },
      'Xác nhận',
      'Hủy bỏ'
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔔 Demo Hệ thống Thông báo</h2>
      <p className={styles.description}>
        Hệ thống thông báo hiện đại thay thế cho browser alert cũ
      </p>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Toast Notifications</h3>
        <div className={styles.buttonGrid}>
          <button 
            onClick={() => handleToastDemo('success')}
            className={`${styles.button} ${styles.success}`}
          >
            ✅ Success Toast
          </button>
          <button 
            onClick={() => handleToastDemo('error')}
            className={`${styles.button} ${styles.error}`}
          >
            ❌ Error Toast
          </button>
          <button 
            onClick={() => handleToastDemo('warning')}
            className={`${styles.button} ${styles.warning}`}
          >
            ⚠️ Warning Toast
          </button>
          <button 
            onClick={() => handleToastDemo('info')}
            className={`${styles.button} ${styles.info}`}
          >
            ℹ️ Info Toast
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Modal Alerts</h3>
        <button 
          onClick={handleConfirmDemo}
          className={`${styles.button} ${styles.modal}`}
        >
          🤔 Confirmation Modal
        </button>
      </div>

      <div className={styles.features}>
        <h3 className={styles.sectionTitle}>Tính năng:</h3>
        <ul className={styles.featureList}>
          <li>🎨 Giao diện hiện đại với animation mượt mà</li>
          <li>📱 Responsive trên mọi thiết bị</li>
          <li>⏰ Auto-dismiss cho toast notifications</li>
          <li>🎯 Type-safe với TypeScript</li>
          <li>♿ Hỗ trợ accessibility</li>
          <li>🎨 CSS Modules cho styling cách ly</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;
