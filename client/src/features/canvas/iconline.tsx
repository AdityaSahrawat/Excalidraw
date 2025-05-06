import { ReactNode } from "react"


export const IconButtons = ({icon , onClick , activated}: 
    {
        icon : ReactNode,
        onClick : ()=>void,
        activated : boolean
    }
)=>{
    return (
        <div className={`${activated ? "text-red-400" : "text-white"} m-2 cursor-pointer rounded-full border p-2 bg-black hover:bg-gray-500 `} onClick={onClick} >
            {icon}
        </div>
    )
}