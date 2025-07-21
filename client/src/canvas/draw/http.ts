import axios from "axios"


export async function getExistingShapes (rootId :string){
    const BackendURL  = process.env.NEXT_PUBLIC_BackendURL
    const response = await axios.get(`${BackendURL}/web/element/${rootId}` , {
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



