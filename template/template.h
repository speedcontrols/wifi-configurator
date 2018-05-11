#ifndef TEMPLATE_HPP
#define TEMPLATE_HPP

#include <ESP8266WiFi.h>

namespace Template {
	const char HEAD[] PROGMEM = "<!DOCTYPE html><html><head><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1,user-scalable=no\"><title>Configurator</title>";
	const char STYLE[] PROGMEM = "<style>#pData{display:none}#pError{}#fData{display:none}input{padding:3px;margin-bottom:10px}button{font-size:1em;margin-bottom:20px}</style></head>";
	const char BODY[] PROGMEM = "<body><div style=text-align:center><h1>Configurator</h1><h4>This is a captive portal ESP Configurator.</h4><p id=pError></p><button onclick=show()>Show config</button><form id=fData action=/send></form></div>";
	const char JS[] PROGMEM = "<script>var pError=document.getElementById('pError');var fData=document.getElementById('fData');var pData=document.getElementById('pData');var data;pError.style='color:red';if(pData&&pData.innerText&&pData.innerText.trim().length){try{data=JSON.parse(pData.innerText);pError.innerText='';for(var d in data){var fInput=document.createElement('input');var fInputName=document.createElement('b');fInputName.append(d+': ');fInput.setAttribute('name',d);fInput.setAttribute('value',data[d]);fData.appendChild(fInputName);fData.appendChild(fInput);fData.appendChild(document.createElement('br'));};var fButton=document.createElement('input');fButton.setAttribute('type','submit');fButton.setAttribute('value','Send config');fButton.setAttribute('style','font-size:1em');fData.appendChild(fButton);fData.setAttribute('style','display:block');}catch(error){pError.innerText=error;}}else if(!pData){pError.style='color:black';pError.innerText='Send the configuration to ESP Serial port and press button';}else pError.innerText='Error: Config not found';function show(){window.location.href='/upload';}</script></body></html>";
}

#endif
