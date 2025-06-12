export type Shape = {
    id : string
    type : 'Rect' ,
    x : number,
    y : number,
    width : number , 
    height : number
} | {
    id : string
    type : 'Circle',
    x : number ,
    y : number , 
    radius : number
} | {
    id : string
    type : 'Line' ,
    x : number,
    y : number ,
    endx : number , // width
    endy : number
} | {
    id : string
    type: 'Pencil',
    points: Array<{x: number, y: number}>,
    color?: string,
    width?: number

} | {
    id : string
    type : 'Arrow',
    x : number,
    y : number ,
    endx : number ,
    endy : number
}

export type AllSahpes = "Rect" | "Pencil" | "Circle" | "Line" | "Arrow" | "Pointer" | "Hand"

export type State = {
    existingShapes: Shape[]; // Assuming getExistingShapes returns Shape[]
    selectedShape: Shape | null;
    isDrawing: boolean;
    currentPencilPath: { x: number; y: number }[];
    clicked: boolean;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    movedShapeIndex: string; // "-1" as string, or you can use number if it's an index
    resizeHandle : string | null,
    endOffsetX : number,
    endOffsetY : number ,
    canvasOffsetX : number,
    canvasOffsetY : number
    canvasScale : number , 
    lastPanx : number
    lastPany : number
}
