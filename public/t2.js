"use strict";(()=>{let e=e=>JSON.parse(new TextDecoder().decode(e.reverse().map(e=>255&~e))),r=e=>new TextEncoder().encode(JSON.stringify(e)).map(e=>255&~e).reverse(),a=e=>window.dispatchEvent(new Event(`TTX-${e}`)),s=(e,t={})=>{if(i.readyState!==i.OPEN){let n=()=>{s(e,t),i.removeEventListener("open",n)};i[c]("open",n);return}a(e),i.send(r({...t,type:e}))},t=()=>{let e=location.href;f=e,s("view",{href:e,focus:d()})},c="addEventListener",n=()=>localStorage.getItem("t")||"",o=e=>localStorage.setItem("t",e),d=()=>document.hasFocus(),f="",i,l=(r=!1)=>{if(!r&&!d()){setTimeout(l,1e3);return}(i=new WebSocket(`wss://space.cch137.link/2/${n()}`))[c]("message",async r=>{let{cmd:s,...c}=e(new Uint8Array(await r.data.arrayBuffer()));switch(s){case"uid":o(c.uid);break;case"conn":{t();let n=setInterval(()=>{if(i.readyState!==i.OPEN)return clearInterval(n);f!==location.href?t():i.send(new Uint8Array([0]))},1e3);break}case"welcome":a("welcome");break;case"block":a("block");break;case"v-err":location.reload()}}),i[c]("error",e=>{console.error(e),i.close()}),i[c]("close",()=>{setTimeout(l,1e3)})};window[c]("blur",()=>s("blur")),window[c]("focus",()=>s("focus")),window[c]("TTX-record",({data:{type:e,data:r}})=>s(e,r)),l(!0)})();