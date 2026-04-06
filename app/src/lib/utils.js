export function today(){return new Date().toISOString().split("T")[0];}
export function cArr(arr,key){const m={};arr.forEach(f=>(f[key]||[]).forEach(v=>{m[v]=(m[v]||0)+1;}));return Object.entries(m).sort((a,b)=>b[1]-a[1]);}
