(() => {
  "use strict";
  const modal=document.getElementById("discountWheelModal");
  const wheel=document.getElementById("discountWheel");
  const form=document.getElementById("discountWheelForm");
  const email=document.getElementById("discountEmail");
  const result=document.getElementById("discountWheelResult");
  const spinButton=document.getElementById("discountSpin");
  if(!modal||!wheel||!form||!email||!result||!spinButton)return;
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const prizes=["3%","5%","7%","10%","3%","5%"];
  let closed=false,spinning=false,lastFocused=null;
  function close(){
    if(closed)return;
    closed=true;modal.hidden=true;document.body.classList.remove("discount-modal-open");
    try{sessionStorage.setItem("tm-discount-demo-seen","1");}catch{}
    if(lastFocused&&lastFocused.isConnected)lastFocused.focus();
  }
  function open(){
    if(closed||!modal.hidden||document.querySelector(".work-lightbox"))return;
    lastFocused=document.activeElement;
    modal.hidden=false;document.body.classList.add("discount-modal-open");
    modal.querySelector(".discount-close").focus({preventScroll:true});
  }
  modal.querySelectorAll("[data-discount-close]").forEach(button=>button.addEventListener("click",close));
  modal.addEventListener("click",e=>{if(e.target===modal)close();});
  document.addEventListener("keydown",e=>{
    if(modal.hidden)return;
    if(e.key==="Escape"){e.preventDefault();close();return;}
    if(e.key!=="Tab")return;
    const focusable=[...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')].filter(el=>el.getClientRects().length);
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
  form.addEventListener("submit",e=>{
    e.preventDefault();
    if(spinning||!form.reportValidity())return;
    // Illustrative prize only: email is never saved, transmitted or added to result.
    spinning=true;spinButton.disabled=true;
    const index=Math.floor(Math.random()*prizes.length);
    const rotation=360*5 + (360-(index*60+30))%360;
    wheel.style.transition=reduceMotion?"none":"transform 3.2s cubic-bezier(.15,.75,.12,1)";
    wheel.style.transform="rotate("+rotation+"deg)";
    const showResult=()=>{
      form.hidden=true;
      result.hidden=false;
      result.querySelector("[data-discount-prize]").textContent=prizes[index];
      spinning=false;
      result.querySelector("button").focus();
    };
    if(reduceMotion)showResult();
    else window.setTimeout(showResult,3300);
  });
  let alreadyShown=false;
  try{alreadyShown=sessionStorage.getItem("tm-discount-demo-seen")==="1";}catch{}
  if(!alreadyShown)window.setTimeout(open,8000);
})();
