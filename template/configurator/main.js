var pError = document.getElementById('pError');
var fData = document.getElementById('fData');
var pData = document.getElementById('pData');
var data;
pError.style = 'color:red';
if(pData && pData.innerText && pData.innerText.trim().length){
    try{ data = JSON.parse(pData.innerText);
         pError.innerText = '';
         for (var d in data){
             var fInput = document.createElement('input');
             var fInputName = document.createElement('b');
             fInputName.append(d+': ');
             fInput.setAttribute('name', d);
             fInput.setAttribute('value', data[d]);
             fData.appendChild(fInputName);
             fData.appendChild(fInput);
             fData.appendChild(document.createElement('br'));
         };
         var fButton = document.createElement('input');
         fButton.setAttribute('type', 'submit');
         fButton.setAttribute('value', 'Send config');
         fButton.setAttribute('style', 'font-size:1em');
         fData.appendChild(fButton);
         fData.setAttribute('style', 'display:block');
    } catch(error){ pError.innerText = error;}
} else if(!pData){
    pError.style = 'color:black';
    pError.innerText = 'Send the configuration to ESP Serial port and press button';
} else pError.innerText = 'Error: Config not found';
function show(){
    window.location.href = '/upload';
}
