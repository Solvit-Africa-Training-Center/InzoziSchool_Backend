import { app } from './server';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import studentsRoutes from './routes/studentsRoutes';

//import { getTranslation } from './routes/languages';

const port = process.env.PORT || 5000;


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//app.get('/api/i18n', getTranslation);

// If studentsRoutes uses router.post('/', ...) then:
app.use('/students', studentsRoutes);

// If studentsRoutes uses router.post('/student', ...) then:
// app.use(studentsRoutes);

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  console.log(`📚 Swagger UI available at http://localhost:${port}/api-docs`);
});