const http_backend = "http://localhost:3009"
import axios from "axios"


export async function getExistingShapes (rootId :String){
    const response = await axios.get(`${http_backend}/v1/web/element/${rootId}` , {
        withCredentials : true
    })
    const shapesArray = response.data.elements
    if (!shapesArray){
        return []
    }
    const shapes = shapesArray.map( (x: {shape: string})=>{
        const shapeData = JSON.parse(x.shape);
        return shapeData
    })

    return shapes
 
}