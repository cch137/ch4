"use strict";(()=>{let e=e=>JSON.parse(new TextDecoder().decode(e.reverse().map(e=>255&~e))),r=e=>new TextEncoder().encode(JSON.stringify(e)).map(e=>255&~e).reverse(),t=(e,s={})=>{if(f.readyState!==f.OPEN){let n=()=>{t(e,s),f.removeEventListener("open",n)};f[a]("open",n);return}f.send(r({...s,type:e}))},s=()=>{let e=location.href;i=e,t("view",{href:e})},a="addEventListener",n=()=>localStorage.getItem("t")||"",c=e=>localStorage.setItem("t",e),i="",f,d=()=>{let r;(f=new WebSocket(`wss://space.cch137.link/${n()}`))[a]("message",async t=>{let{cmd:a,...n}=e(new Uint8Array(await t.data.arrayBuffer()));switch(a){case"uid":c(n.uid),clearInterval(r),r=setInterval(()=>{if(f.readyState!==f.OPEN)return clearInterval(r);i!==location.href?s():f.send(new Uint8Array([0]))},1e3);break;case"view":s()}}),f[a]("error",e=>{console.error(e),f.close()}),f[a]("close",()=>{let e=setInterval(()=>{document.hasFocus()||(clearInterval(e),d())},1e3)})};window[a]("blur",()=>t("blur")),window[a]("focus",()=>t("focus")),d()})();