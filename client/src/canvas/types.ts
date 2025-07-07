export type Shape = {
    id : string
    type : 'Rect' ,
    x : number,
    y : number,
    width : number , 
    height : number,
    strokeWidth : number
    fillColor: string;
    strokeColor: string;
    opacity: number;
} | {
    id : string
    type : 'Circle',
    x : number ,
    y : number , 
    radius : number,
    strokeWidth : number
    fillColor: string;
    strokeColor: string;
    opacity: number;
} | {
    id : string
    type : 'Line' ,
    x : number,
    y : number ,
    endx : number , // width
    endy : number,
    strokeWidth : number
    strokeColor: string;
    opacity: number;
} | {
    id : string
    type: 'Pencil',
    points: Array<{x: number, y: number}>,
    strokeWidth : number
    strokeColor: string;
    opacity: number;

} | {
    id : string
    type : 'Arrow',
    x : number,
    y : number ,
    endx : number ,
    endy : number
    strokeWidth : number
    strokeColor: string;
    opacity: number;
}

export type AllShapes = "Rect" | "Pencil" | "Circle" | "Line" | "Arrow" | "Pointer" | "Hand"

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

export type strokeOptions = ["#FFFFFF", "#dc2626", "#2563eb", "#16a34a"];
export type fillOptions = ["#FFFFFF", "#f05454", "#4d7ef0", "#3bbf6d"];
export type strokeWidths = [1, 2, 3];

