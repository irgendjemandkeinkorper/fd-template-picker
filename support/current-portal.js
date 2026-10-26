document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
if(window.matchMedia('(max-width:1200px)').matches)document.querySelector('.toc-box')?.removeAttribute('open');
