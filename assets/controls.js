/* Public-package controls; no network calls; D3 is bundled locally. */
'use strict';
MBBTheme.chart(CHART_CONFIG);
window.mbb.seek(window.mbb.duration);
document.querySelector('#replay').addEventListener('click',()=>window.mbb.replay());
const selector=document.querySelector('#palette');
selector.value=CHART_CONFIG.palette||'default';
selector.addEventListener('change',()=>{
  const config={...window.mbb.config,palette:selector.value};
  if(selector.value==='default')delete config.palette;
  MBBCharts.render(config);
  window.mbb.seek(window.mbb.duration);
});
function chartSVG(){
  const a=window.mbb;
  a.pause();a.resetInteraction?.();a.hide();a.seek(a.duration);
  const clone=a.svg.cloneNode(true),original=[a.svg,...a.svg.querySelectorAll('*')],nodes=[clone,...clone.querySelectorAll('*')];
  const properties=['fill','stroke','stroke-width','stroke-opacity','fill-opacity','font-family','font-size','font-weight','text-anchor','dominant-baseline','opacity','visibility','stroke-dasharray','stroke-dashoffset'];
  original.forEach((node,i)=>{const s=getComputedStyle(node);properties.forEach(k=>nodes[i].style.setProperty(k,s.getPropertyValue(k)));nodes[i].removeAttribute('tabindex');nodes[i].removeAttribute('data-mark');});
  const box=a.svg.viewBox.baseVal;
  clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  clone.setAttribute('width',box.width);clone.setAttribute('height',box.height);
  clone.removeAttribute('class');clone.style.width=box.width+'px';clone.style.height=box.height+'px';
  const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
  for(const [k,v] of Object.entries({x:box.x,y:box.y,width:box.width,height:box.height,fill:a.palette.background}))bg.setAttribute(k,v);
  clone.prepend(bg);
  return new XMLSerializer().serializeToString(clone);
}
window.ChartExport={svg:chartSVG};
document.querySelector('#export-svg').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([chartSVG()],{type:'image/svg+xml;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=CHART_CONFIG.type+'.svg';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.querySelector('#export-status').textContent='SVG 已导出；文字、路径和形状可编辑。';
});
