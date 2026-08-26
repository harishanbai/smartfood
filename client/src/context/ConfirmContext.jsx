import React, { createContext, useContext, useState, useRef } from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});
  const resolveRef = useRef(null);

  const confirm = React.useCallback((opts = {}) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(true);
    }
  }, []);

  const handleCancel = React.useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(false);
    }
  }, []);

  // Select styling based on confirmation type
  const type = options.type || 'danger'; // default is danger for delete
  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  let iconColor = 'text-accentPurple bg-accentPurple/10 border-accentPurple/20';
  let icon = <HelpCircle className="h-8 w-8" />;
  let buttonColor = 'bg-gradient-to-r from-accentPurple to-accentOrange';

  if (isDanger) {
    iconColor = 'text-red-500 bg-red-500/10 border-red-500/20';
    icon = <Trash2 className="h-8 w-8" />;
    buttonColor = 'bg-red-500 hover:bg-red-600 shadow-red-500/20';
  } else if (isWarning) {
    iconColor = 'text-accentOrange bg-accentOrange/10 border-accentOrange/20';
    icon = <AlertTriangle className="h-8 w-8" />;
    buttonColor = 'bg-accentOrange hover:bg-accentOrange/90 shadow-accentOrange/20';
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-fade {
          animation: modalFadeIn 0.2s ease-out forwards;
        }
        .animate-modal-scale {
          animation: modalScaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-modal-fade">
          <div className="glass-panel max-w-sm w-full rounded-[24px] p-6 border border-white/10 relative shadow-2xl flex flex-col items-center text-center animate-modal-scale">
            
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className={`p-4 rounded-2xl mb-4 border ${iconColor}`}>
              {icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
              {options.title || t('common.delete')}
            </h3>

            {/* Message */}
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              {options.message || t('foods.confirmDelete')}
            </p>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white rounded-xl transition-all cursor-pointer min-h-[40px]"
              >
                {options.cancelText || t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer min-h-[40px] ${buttonColor}`}
              >
                {options.confirmText || (isDanger ? t('common.delete') : t('common.save'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
