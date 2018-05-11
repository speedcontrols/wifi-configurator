#!/bin/bash

OUT="template/template.h"
HTML="template/index.html"

[[ $@ ]] || { echo "Usage $0 name_of_build - one from ./template directory. Example $0 alaska-ru"; exit 1; }
LNG=$1
export LNG=$LNG

function write {
    local template=$1
    local var=$2
    local opentag=$3
    local closetag=$4
    local type=$5
    local html=`cat ./template/$LNG/$template | ./tools/minify --type=$type | sed 's/\"/\\\"/g'`
    echo "	const char $var PROGMEM = \"${opentag}${html}${closetag}\";" >> $OUT
    echo "${opentag}${html}${closetag}" >> $HTML
}

>$OUT
>$HTML
echo "#ifndef TEMPLATE_HPP" >> $OUT
echo "#define TEMPLATE_HPP" >> $OUT
echo >> $OUT
echo "#include <ESP8266WiFi.h>" >> $OUT
echo >> $OUT
echo "namespace Template {" >> $OUT

write "head.html" "HEAD[]" "<!DOCTYPE html><html><head>" "" "html"
write "style.css" "STYLE[]" "<style>" "</style></head>" "css"
write "body.html" "BODY[]" "<body>" "" "html"
write "main.js" "JS[]" "<script>" "</script></body></html>" "js"

echo "}" >> $OUT
echo >> $OUT
echo "#endif" >> $OUT
