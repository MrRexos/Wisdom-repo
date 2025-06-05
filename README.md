# Wisdom

## Descripción del proyecto
Wisdom es una aplicación móvil desarrollada con React Native que conecta a usuarios con profesionales que ofrecen cualquier servicio. Los usuarios pueden buscar, reservar y pagar por servicios, mientras que los expertos pueden crear perfiles, gestionar sus citas y comunicarse con sus clientes.

## Características principales
- Búsqueda de servicios por categoría o palabra clave.
- Perfil detallado de profesionales.
- Reserva de citas con calendario integrado.
- Sistema de pago seguro integrado.
- Chat interno entre cliente y profesional.
- Favoritos y gestión de servicios guardados.
- Modo cliente y modo experto en una sola app.
- Panel de administración para expertos.
- Soporte multilingüe y modo oscuro.

## Tecnologías utilizadas
- React Native + Expo
- JavaScript / TypeScript
- React Navigation
- Axios
- AsyncStorage
- Tailwind CSS (via NativeWind)
- i18next (internacionalización)
- Expo SDK (ubicación, imágenes, notificaciones, etc.)

## Requisitos previos
- Node.js (versión recomendada: 18+)
- Expo CLI (`npm install -g expo-cli`)
- Emulador o dispositivo físico
- (Opcional) Cuenta de Expo y app Expo Go

```
Wisdom_expo/
├── App.js                 # Punto de entrada de la app
├── app.json               # Configuración de Expo
├── assets/                # Íconos, fuentes e imágenes
├── languages/             # Archivos de traducción
├── navigation/            # Definición de navegadores y rutas
├── screens/               # Pantallas divididas por módulos
├── utils/                 # Utilidades (API, AsyncStorage)
├── theme/                 # Colores y estilos base
└── package.json           # Dependencias y scripts
```

## Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/MrRexos/Wisdom-repo.git
   cd Wisdom-repo/Wisdom_expo
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta la app:
   ```bash
   npm start
   ```
4. Abre en Expo Go o en un emulador de Android/iOS.

## Uso
- Inicia sesión o regístrate.
- Busca servicios y explora perfiles.
- Reserva citas y paga desde la app.
- Usa el chat para comunicarte con los profesionales.
- Cambia a modo experto para ofrecer tus propios servicios.

## Contribuir
1. Haz fork del repo.
2. Crea una rama para tu funcionalidad (`feature/nombre`).
3. Haz tus cambios y préuebalos localmente.
4. Abre un Pull Request explicando tus aportaciones.

## Compilación

Para generar una versión de producción puedes usar [EAS Build](https://docs.expo.dev/eas-build/introduction/):

```bash
npx eas build --platform android
npx eas build --platform ios
```

Asegúrate de haber configurado previamente los permisos y certificados necesarios en `eas.json` y `app.json`.

## Licencia
Actualmente no se especifica una licencia. Todos los derechos reservados al autor.

## Agradecimientos
Desarrollado por MrRexos. Gracias a la comunidad de software libre por las herramientas y librerías utilizadas.
