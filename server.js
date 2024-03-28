const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;


// Configuración de Multer para almacenar archivos subidos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg')
  }
});


const upload = multer({ storage: storage });
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Función de utilidad para leer datos de un archivo JSON
function readData(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });
}

// Función de utilidad para escribir datos en un archivo JSON
function writeData(file, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Endpoint para crear una nueva vacuna
app.post('/vacunas', async (req, res) => {
    try {
        const nombreVacuna = req.body.nombre;
        if (!nombreVacuna) {
            return res.status(400).send('El nombre de la vacuna es requerido');
        }
        const nuevaVacuna = {
            uuid: uuidv4(), // Generando un UUID para la nueva vacuna
            nombre: nombreVacuna
        };
        const vacunas = await readData('./vacunas.json');
        vacunas.push(nuevaVacuna);
        await writeData('./vacunas.json', vacunas);
        res.status(201).send('Vacuna agregada');
    } catch (err) {
        res.status(500).send('Error al guardar');
    }
});

// Endpoint para crear una nueva Persona (Dueño mascota)
app.post('/personas', async (req, res) => {
  try {
      const { nombre, apellidos, edad, telefono, email, domicilio } = req.body;

      // Campos requeridos.
      if (!nombre || !apellidos || !edad || !telefono || !email || !domicilio) {
          return res.status(400).send('Todos los campos son requeridos');
      }

      const nuevaPersona = {
          id: uuidv4(),
          nombre,
          apellidos,
          edad,
          telefono,
          email,
          domicilio
      };

      const personas = await readData('./personas.json');
      personas.push(nuevaPersona);
      await writeData('./personas.json', personas);
      res.status(201).send('Persona agregada con éxito');
  } catch (err) {
      res.status(500).send('Error al guardar');
  }
});


// Endpoint para obtener todas las mascotas
app.get('/mascotas', async (req, res) => {
  try {
      const mascotas = await readData('./mascotas.json');
      res.json(mascotas);
  } catch (err) {
      res.status(500).send('Error');
  }
});

// Endpoint para Crear mascotas
app.post('/mascotas', upload.single('image'), async (req, res) => {
  try {

      const { nombre, sexo, edad_aproximada, fecha_rescate, persona, vacuna } = req.body;
      const image = req.file.path;
      console.log(image)


      const nuevaMascota = {
          id: uuidv4(), // Generar UUID
          nombre,
          sexo,
          edad_aproximada,
          fecha_rescate,
          image,
          persona, // UUID Dueño
          vacuna // UUID de la vacuna
      };

      const mascotas = await readData('./mascotas.json');
      mascotas.push(nuevaMascota);
      await writeData('./mascotas.json', mascotas);
      res.status(201).send('Mascota agregada');
  } catch (err) {
      res.status(500).send('Error al guardar');
  }
});

// GET Mascota
app.get('/mascotas/:uuid', async (req, res) => {
  try {
      const uuid = req.params.uuid;
      const mascotas = await readData('./mascotas.json');
      const mascota = mascotas.find(m => m.id === uuid);

      if (mascota) {
          res.json(mascota);
      } else {
          res.status(404).send('Mascota no encontrada');
      }
  } catch (err) {
      res.status(500).send('Error al leer el archivo de mascotas');
  }
});


// PUT Mascota
app.put('/mascotas/:uuid', async (req, res) => {
  try {
      const uuid = req.params.uuid;
      console.log(uuid)
      console.log(req.body)
      const mascotas = await readData('./mascotas.json');
      const index = mascotas.findIndex(m => m.id === uuid);
      console.log(index)

      if (index !== -1) {
          // Actualizar campos de req.body
          mascotas[index] = { ...mascotas[index], ...req.body };
          await writeData('./mascotas.json', mascotas);
          res.send('Mascota actualizada con éxito');
      } else {
          res.status(404).send('Mascota no encontrada');
      }
  } catch (err) {
      res.status(500).send('Error al actualizar la mascota');
  }
});

// Eliminar mascotas
app.delete('/mascotas/:uuid', async (req, res) => {
  try {
      const uuid = req.params.uuid;
      const mascotas = await readData('./mascotas.json');
      const index = mascotas.findIndex(m => m.id === uuid);

      if (index !== -1) {
          mascotas.splice(index, 1); // Eliminando la mascota del array en el archivo mascotas.json
          await writeData('./mascotas.json', mascotas);
          res.send('Mascota eliminada');
      } else {
          res.status(404).send('Mascota no encontrada');
      }
  } catch (err) {
      res.status(500).send('Error al eliminar la mascota');
  }
});



// RUN
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
