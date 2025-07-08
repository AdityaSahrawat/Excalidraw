"use client"

import {create} from "zustand"
import { AllShapes } from "./types"


type SideBarState = {
    strokeWidth: number
    setStrokeWidth: (width: number) => void

    fillColor: string
    setFillColor: (color: string) => void

    opacity: number 
    setOpacity: (value: number) => void

    strokeColor : string
    setStrokeColor : (color : string)=> void
}

type SelectedToolState = {
    selectedTool : AllShapes
    setSelectedTool : (tool: AllShapes) => void
}

export const useSideBarStore = create<SideBarState>( (set)=>({
    strokeWidth : 1,
    setStrokeWidth : (width)=> set({strokeWidth : width}),
    
    fillColor : "#f05454",
    setFillColor : (color)=> set({fillColor : color}),
    
    opacity: 100,
    setOpacity : (value)=> set({opacity : value}),
    
    strokeColor : "#FFFFFF",
    setStrokeColor : (color)=> set({strokeColor : color}),
}))

export const useSeletedTool = create<SelectedToolState>( (set)=>({
    selectedTool : "Rect",
    setSelectedTool : (tool) => (set)({selectedTool : tool})
}))
