"use client";
import { useEffect,useState,type Dispatch,type SetStateAction } from "react";
type Item = { id:number|string; price:number; quantity:number; variantId?:number; size?:string; color?:string };
export function useCartPrices<T extends Item>(items:T[],setItems:Dispatch<SetStateAction<T[]>>) {
 const [error,setError]=useState("");
 const signature=JSON.stringify(items.map(({id,quantity,variantId,size,color})=>({id,quantity,variantId,size,color})));
 useEffect(()=>{const input=JSON.parse(signature);if(!input.length)return;const controller=new AbortController();fetch("/api/cart/quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:input}),signal:controller.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.message);setItems(current=>{ if (controller.signal.aborted || JSON.stringify(current.map(({id,quantity,variantId,size,color})=>({id,quantity,variantId,size,color}))) !== signature) return current; return current.map((item,index)=>({...item,...data.items[index]})); });setError("");}).catch(error=>{if(error.name!=="AbortError")setError(error.message);});return()=>controller.abort();},[signature,setItems]);
 return error;
}
export function cartLineKey(item:Item){return [item.id,item.variantId??"",item.size??"",item.color??""].join(":");}
