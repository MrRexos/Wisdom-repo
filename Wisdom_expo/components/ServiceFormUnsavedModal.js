import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalMessage from './ModalMessage';

export default function ServiceFormUnsavedModal({ visible, onSave, onDiscard, onDismiss }) {
  const { t } = useTranslation();

  return (
    <ModalMessage
      visible={visible}
      title={t('service_edit_unsaved_title')}
      description={t('service_edit_unsaved_message')}
      confirmText={t('save')}
      cancelText={t('dont_save')}
      onConfirm={onSave}
      onCancel={onDiscard}
      onDismiss={onDismiss}
      dismissOnBackdropPress={false}
    />
  );
}
