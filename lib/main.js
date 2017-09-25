import { startServer } from  './server'
import { captureFromFitzbox } from './startCapture'

const config = require('../../config.json')

try {
    captureFromFitzbox(config)
    const server = startServer(3000)
} catch (e) {
    console.log('Erorr in main: ', e)
}
