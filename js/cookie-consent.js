(()=>{
"use strict";
const KEY="tm_cookie_consent_v1";
const GA_ID=""; // Set verified G-XXXXXXXXXX before production.
const META_ID=""; // Set verified numeric Meta Pixel ID before production.
const banner=document.getElementById("cookieBanner"),settings=document.getElementById("cookieSettings"),analytics=document.getElementById("cookieAnalytics"),marketing=document.getElementById("cookieMarketing");
if(!banner||!settings)return;
const denied={analytics:false,marketing:false};
let current=null,gaLoaded=false,metaLoaded=false;
function read(){try{const c=JSON.parse(localStorage.getItem(KEY));return c&&c.version===1&&typeof c.analytics==="boolean"&&typeof c.marketing==="boolean"?c:null;}catch{return null;}}
function save(c){try{localStorage.setItem(KEY,JSON.stringify({version:1,analytics:c.analytics,marketing:c.marketing,updated:new Date().toISOString()}));}catch{}}
function initGoogle(){
 if(gaLoaded||!/^G-[A-Z0-9]+$/.test(GA_ID))return;
 gaLoaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
 window.gtag("js",new Date());
 window.gtag("consent","update",{analytics_storage:"granted",ad_storage:current.marketing?"granted":"denied",ad_user_data:current.marketing?"granted":"denied",ad_personalization:current.marketing?"granted":"denied"});
 window.gtag("config",GA_ID,{send_page_view:true});
 const script=document.createElement("script");script.async=true;script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(GA_ID);document.head.appendChild(script);
}
function initMeta(){
 if(metaLoaded||!/^\d{7,25}$/.test(META_ID))return;
 metaLoaded=true;
 !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
 window.fbq("init",META_ID);window.fbq("track","PageView");
}
function apply(c){
 current={analytics:!!c.analytics,marketing:!!c.marketing};
 if(current.analytics)initGoogle();
 if(gaLoaded&&window.gtag)window.gtag("consent","update",{analytics_storage:current.analytics?"granted":"denied",ad_storage:current.marketing?"granted":"denied",ad_user_data:current.marketing?"granted":"denied",ad_personalization:current.marketing?"granted":"denied"});
 if(current.marketing)initMeta();
 if(metaLoaded&&window.fbq)window.fbq("consent",current.marketing?"grant":"revoke");
 // Revoking consent prevents future tracking; reload to stop any previously loaded trackers.
}
function close(){banner.hidden=true;settings.hidden=true;document.body.classList.remove("cookie-dialog-open");}
function choose(c){const old=current;save(c);apply(c);close();if(old&&((old.analytics&&!c.analytics)||(old.marketing&&!c.marketing)))location.reload();}
function openSettings(){analytics.checked=current?current.analytics:false;marketing.checked=current?current.marketing:false;settings.hidden=false;banner.hidden=true;document.body.classList.add("cookie-dialog-open");settings.querySelector("button").focus();}
document.querySelectorAll("[data-cookie-action]").forEach(b=>b.addEventListener("click",()=>{
 const action=b.dataset.cookieAction;
 if(action==="accept")choose({analytics:true,marketing:true});
 if(action==="reject")choose(denied);
 if(action==="customize")openSettings();
 if(action==="save")choose({analytics:analytics.checked,marketing:marketing.checked});
 if(action==="close"){settings.hidden=true;if(!current)banner.hidden=false;else document.body.classList.remove("cookie-dialog-open");}
}));
document.addEventListener("click",e=>{if(e.target.closest("[data-open-cookie-settings]")){e.preventDefault();openSettings();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!settings.hidden){e.preventDefault();if(current){settings.hidden=true;document.body.classList.remove("cookie-dialog-open");}else{settings.hidden=true;banner.hidden=false;}}});
const stored=read();if(stored){apply(stored);close();}else{banner.hidden=false;}
})();
