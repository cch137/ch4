"use strict";(()=>{let e=e=>JSON.parse(new TextDecoder().decode(e.reverse().map(e=>255&~e))),r=e=>new TextEncoder().encode(JSON.stringify(e)).map(e=>255&~e).reverse(),t=e=>window.dispatchEvent(new Event(`TTX-${e}`)),s=(e,a={})=>{if(d.readyState!==d.OPEN){let c=()=>{s(e,a),d.removeEventListener("open",c)};d[n]("open",c);return}t(e),d.send(r({...a,type:e}))},a=()=>{let e=location.href;o=e,s("view",{href:e,focus:i()})},n="addEventListener",c=()=>localStorage.getItem("t")||"",f=e=>localStorage.setItem("t",e),i=()=>document.hasFocus(),o="",d,u=(r=!1)=>{if(!r&&!i()){setTimeout(u,1e3);return}(d=new WebSocket(`wss://space.cch137.link/3/${c()}`))[n]("message",async r=>{let{cmd:s,...n}=e(new Uint8Array(await r.data.arrayBuffer()));if("string"==typeof s)switch(t(s),s){case"uid":f(n.uid);break;case"conn":{a();let c=setInterval(()=>{if(d.readyState!==d.OPEN)return clearInterval(c);o!==location.href?a():d.send(new Uint8Array([0]))},1e3);break}case"v-err":location.reload()}}),d[n]("error",e=>{console.error(e),d.close()}),d[n]("close",()=>{setTimeout(u,1e3)})};window[n]("blur",()=>s("blur")),window[n]("focus",()=>s("focus")),window[n]("TTX-record",({data:{type:e,data:r}})=>s(e,r)),u(!0)})();