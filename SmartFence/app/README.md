# /app

Esta carpeta se deja reservada tal como fue solicitada en la arquitectura,
pero **no se usa** en este proyecto: la navegación se maneja con
`@react-navigation` (Stack + Bottom Tabs) dentro de `src/navigation/`,
no con Expo Router. Si en el futuro se quiere migrar a Expo Router,
las pantallas de `src/screens` se pueden mover aquí como rutas basadas
en archivos sin reescribir su lógica interna.
