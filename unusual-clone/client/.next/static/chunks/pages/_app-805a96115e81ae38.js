(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[636],{2149:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>l});var i=n(7876);n(6048);var a=n(7328),o=n.n(a),r=n(5105),s=n.n(r);let l=function(e){let{Component:t,pageProps:n}=e;return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(o(),{children:[(0,i.jsx)("title",{children:"Content Personalization Tools"}),(0,i.jsx)("meta",{name:"description",content:"Tools for testing and integrating with the content personalization service"}),(0,i.jsx)("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),(0,i.jsx)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,i.jsx)(s(),{id:"spa-routing",strategy:"beforeInteractive",children:`
          // Handle SPA routing by listening for link clicks
          document.addEventListener('click', function(event) {
            // Check if the clicked element is a link
            const link = event.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin)) {
              // Prevent default behavior
              event.preventDefault();
              
              // Get the path
              const path = link.href.replace(window.location.origin, '');
              
              // Handle SPA navigation
              window.history.pushState({}, '', path);
              
              // Trigger a popstate event
              const popStateEvent = new PopStateEvent('popstate', { state: {} });
              dispatchEvent(popStateEvent);
            }
          });
        `}),(0,i.jsx)(t,{...n})]})}},5105:(e,t,n)=>{e.exports=n(7195)},6048:()=>{},6556:(e,t,n)=>{(window.__NEXT_P=window.__NEXT_P||[]).push(["/_app",function(){return n(2149)}])},7328:(e,t,n)=>{e.exports=n(9836)}},e=>{var t=t=>e(e.s=t);e.O(0,[593,792],()=>(t(6556),t(8253))),_N_E=e.O()}]);