import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.modalOverlay} 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div 
            className={styles.modalContent} 
            onClick={(e) => e.stopPropagation()}
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              y: -50,
              x: 100
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 50,
              x: -100
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{title}</h3>
              <button className={styles.modalClose} onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

