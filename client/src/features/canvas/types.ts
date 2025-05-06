export type Shape = {
    type : "Rect" ,
    x : number,
    y : number,
    width : number , 
    height : number
} | {
    type : "Circle",
    x : number ,
    y : number , 
    radius : number
} | {
    type : "Line" ,
    x : number,
    y : number ,
    endx : number ,
    endy : number
} | {
    type: "Pencil",
    points: Array<{x: number, y: number}>,
    color?: string,
    width?: number

} | {
    type : "Arrow",
    x : number,
    y : number ,
    endx : number ,
    endy : number
}

export type AllSahpes = "Rect" | "Pencil" | "Circle" | "Line" | "Arrow"