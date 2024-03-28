# mascotas_api_node
CRUD mascotas en adopcion con NODE.js usando express.js

### Instalacion
1-Instalar dependencias:
```
npm install
```
2-Run
```
npm run dev
```
### Entidades
```
VACUNAS:
   nombre

PERSONAS:
  nombre
  apellidos
  edad
  telefono
  email
  domicilio

MASCOTAS:
  nombre
  sexo
  edad_aproximada
  fecha_rescate
  image
  persona > ID del dueño
  vacuna > ID de la vacuna
```
