# Componentes de Mensajes

Este directorio contiene tres componentes reutilizables para mostrar mensajes en la aplicación:

## 1. SlideMessage
Mensaje que se desliza desde arriba con animación y se oculta automáticamente.

### Características:
- Se desliza desde arriba durante 0.2s
- Se mantiene visible durante 2.2s (configurable)
- Se puede deslizar hacia arriba para ocultarlo manualmente
- Se oculta automáticamente después del tiempo configurado

### Uso básico:
```jsx
import SlideMessage from './components/SlideMessage';

<SlideMessage
  visible={showMessage}
  title="Missatge 1"
  description="Descripció del missatge"
  onDismiss={() => setShowMessage(false)}
/>
```

### Props disponibles:
- `visible`: Boolean - Controla la visibilidad
- `title`: String - Título del mensaje
- `description`: String - Descripción del mensaje
- `onDismiss`: Function - Callback cuando se oculta
- `autoHide`: Boolean - Si se oculta automáticamente (default: true)
- `autoHideDelay`: Number - Tiempo en ms antes de ocultarse (default: 2200)
- `backgroundColor`: String - Color de fondo
- `titleColor`: String - Color del título
- `descriptionColor`: String - Color de la descripción
- `buttonColor`: String - Color del botón principal
- `buttonTextColor`: String - Color del texto del botón

## 2. ModalMessage
Mensaje modal que aparece en el centro de la pantalla.

### Características:
- Aparece en el centro con animación de opacidad (0.1s)
- Puede ocultarse al tocar fuera o permanecer hasta presionar un botón
- Overlay semi-transparente
- Animación de escala suave

### Uso básico:
```jsx
import ModalMessage from './components/ModalMessage';

<ModalMessage
  visible={showModal}
  title="Missatge 2"
  description="Descripció del missatge modal"
  onConfirm={() => {
    console.log('Confirmado');
    setShowModal(false);
  }}
  onCancel={() => setShowModal(false)}
  onDismiss={() => setShowModalMessage(false)}
/>
```

### Props disponibles:
- `visible`: Boolean - Controla la visibilidad
- `title`: String - Título del mensaje
- `description`: String - Descripción del mensaje
- `onConfirm`: Function - Callback del botón confirmar
- `onCancel`: Function - Callback del botón cancelar
- `onDismiss`: Function - Callback cuando se oculta
- `confirmText`: String - Texto del botón confirmar (default: "D'acord")
- `cancelText`: String - Texto del botón cancelar (default: "Cancel·lar")
- `showCancel`: Boolean - Si mostrar el botón cancelar (default: true)
- `overlayColor`: String - Color del overlay
- `dismissOnBackdropPress`: Boolean - Si permite ocultar al tocar fuera (default: true)

## 3. Message (Componente unificado)
Componente que permite elegir entre SlideMessage y ModalMessage.

### Uso básico:
```jsx
import Message from './components/Message';

// Mensaje deslizante
<Message
  type="slide"
  visible={showSlideMessage}
  title="Missatge 1"
  description="Descripció"
  onDismiss={() => setShowSlideMessage(false)}
/>

// Mensaje modal
<Message
  type="modal"
  visible={showModalMessage}
  title="Missatge 2"
  description="Descripció"
  onConfirm={() => setShowModalMessage(false)}
  onCancel={() => setShowModalMessage(false)}
/>
```

### Props disponibles:
- `type`: String - Tipo de mensaje ('slide' o 'modal')
- Todas las props de SlideMessage y ModalMessage según el tipo seleccionado

## Ejemplo completo de implementación:

```jsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Message from './components/Message';

const ExampleScreen = () => {
  const [showSlideMessage, setShowSlideMessage] = useState(false);
  const [showModalMessage, setShowModalMessage] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => setShowSlideMessage(true)}
        style={{ padding: 20, backgroundColor: '#007AFF', borderRadius: 10, marginBottom: 20 }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Mostrar Missatge Deslizant</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowModalMessage(true)}
        style={{ padding: 20, backgroundColor: '#34C759', borderRadius: 10 }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Mostrar Missatge Modal</Text>
      </TouchableOpacity>

      {/* Mensaje deslizante */}
      <Message
        type="slide"
        visible={showSlideMessage}
        title="Missatge 1"
        description="Aquest missatge es deslitzarà des de dalt"
        onDismiss={() => setShowSlideMessage(false)}
        autoHide={true}
        autoHideDelay={2200}
      />

      {/* Mensaje modal */}
      <Message
        type="modal"
        visible={showModalMessage}
        title="Missatge 2"
        description="Aquest missatge apareixerà al centre de la pantalla"
        onConfirm={() => {
          console.log('Missatge confirmat');
          setShowModalMessage(false);
        }}
        onCancel={() => setShowModalMessage(false)}
        onDismiss={() => setShowModalMessage(false)}
        confirmText="D'acord"
        cancelText="Cancel·lar"
      />
    </View>
  );
};

export default ExampleScreen;
```

## Personalización de estilos:

Todos los componentes aceptan props de estilo que permiten personalizar completamente la apariencia:

```jsx
<Message
  type="slide"
  visible={showMessage}
  title="Missatge Personalitzat"
  description="Amb estils personalitzats"
  backgroundColor="#FF6B6B"
  titleColor="#FFFFFF"
  descriptionColor="#FFE5E5"
  buttonColor="#4ECDC4"
  buttonTextColor="#FFFFFF"
  style={{ margin: 8 }}
  titleStyle={{ fontSize: 22, fontWeight: 'bold' }}
  descriptionStyle={{ fontSize: 16, fontStyle: 'italic' }}
/>
``` 