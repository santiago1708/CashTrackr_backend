import express from 'express'
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import budgetRouter from './routes/budgetRouter'
import routerAuth from './routes/AuthRouter'

async function connectDB() {
    try { 
        await db.authenticate() //Autenticar con la base de datos
        db.sync() //Crear tablas y columnas en automatico

        console.log( colors.blue.bold('Conexion exitosa a la BD'))
    } catch (error) {
        //console.log(error)
        console.log( colors.red.bold('Conexion fallida a la BD'))
    }
}

connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use('/api/budgets', budgetRouter)
app.use('/api/auth', routerAuth)



export default app 