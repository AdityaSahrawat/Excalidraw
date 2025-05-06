const http_backend = "http://localhost:3009"
import axios from "axios"


export async function getExistingShapes (rootId :String){
    const response = await axios.get(`${http_backend}/v1/web/chats/${rootId}`)
    console.log(response)
    const shapesArray = response.data.chats
    if (!shapesArray){
        return []
    }
    const shapes = shapesArray.map( (x: {message: string})=>{
        const shapeData = JSON.parse(x.message);
        return shapeData
    })

    return shapes
 
}