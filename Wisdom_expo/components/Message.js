import React from 'react';
import SlideMessage from './SlideMessage';
import ModalMessage from './ModalMessage';

const Message = ({
  type = 'slide', // 'slide' o 'modal'
  visible = false,
  title = "Missatge",
  description = "Descripció",
  onDismiss,
  onConfirm,
  onCancel,
  // Props específicos para SlideMessage
  autoHide = true,
  autoHideDelay = 2200,
  mark="check",
  // Props específicos para ModalMessage
  confirmText = "D'acord",
  cancelText = "Cancel·lar",
  showCancel = true,
  showCancelColor = false,
  dismissOnBackdropPress = false,
  // Props de estilo generales
  style = {},
  titleStyle = {},
  descriptionStyle = {},
  buttonStyle = {},
  buttonTextStyle = {},
  backgroundColor = null,
  titleColor = null,
  descriptionColor = null,
  buttonColor = null,
  buttonTextColor = null,
  // Props específicos para ModalMessage
  confirmButtonStyle = {},
  cancelButtonStyle = {},
  confirmButtonTextStyle = {},
  cancelButtonTextStyle = {},
  confirmButtonColor = null,
  cancelButtonColor = null,
  confirmButtonTextColor = null,
  cancelButtonTextColor = null,
  overlayColor = null
}) => {
  if (type === 'slide') {
    return (
      <SlideMessage
        visible={visible}
        title={title}
        description={description}
        onDismiss={onDismiss}
        autoHide={autoHide}
        autoHideDelay={autoHideDelay}
        style={style}
        titleStyle={titleStyle}
        descriptionStyle={descriptionStyle}
        buttonStyle={buttonStyle}
        buttonTextStyle={buttonTextStyle}
        backgroundColor={backgroundColor}
        titleColor={titleColor}
        descriptionColor={descriptionColor}
        buttonColor={buttonColor}
        buttonTextColor={buttonTextColor}
        mark={mark}
      />
    );
  }

  if (type === 'modal') {
    return (
      <ModalMessage
        visible={visible}
        title={title}
        description={description}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onDismiss={onDismiss}
        confirmText={confirmText}
        cancelText={cancelText}
        showCancel={showCancel}
        showCancelColor={showCancelColor}
        dismissOnBackdropPress={dismissOnBackdropPress}
        style={style}
        titleStyle={titleStyle}
        descriptionStyle={descriptionStyle}
        confirmButtonStyle={confirmButtonStyle}
        cancelButtonStyle={cancelButtonStyle}
        confirmButtonTextStyle={confirmButtonTextStyle}
        cancelButtonTextStyle={cancelButtonTextStyle}
        backgroundColor={backgroundColor}
        titleColor={titleColor}
        descriptionColor={descriptionColor}
        confirmButtonColor={confirmButtonColor}
        cancelButtonColor={cancelButtonColor}
        confirmButtonTextColor={confirmButtonTextColor}
        cancelButtonTextColor={cancelButtonTextColor}
        overlayColor={overlayColor}
      />
    );
  }

  return null;
};

export default Message; 