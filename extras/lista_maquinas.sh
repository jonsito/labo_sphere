#!/bin/bash

# detectamos si estamos en un script source'd o invocado directamente
EXIT=exit
[ "${BASH_SOURCE[0]}" != "${0}" ] && EXIT=return

# Lista de maquinas temporalmente fuera de servicvio
# JAMC 13-28 Abril 2021 add 175-l186 para practicas de maquinas virtuales
EXCLUDE="l127 l128 l169 l170 l171 l172 l173 l174 l175 l176 l177 l178 l179 l180 l181 l182 l183 l184 l185 l186"

# A-127-2 equipos del 221 al 254.
# el l221 es el del profesor
A127_2=$(a=221; while [ $a -lt 255 ]; do printf "l%03d " $a; a=`expr $a + 1`; done )

# A-127-3 equipos del 187 al 220.
# el l187 es el del profesor
A127_3=$(a=187; while [ $a -lt 221 ]; do printf "l%03d " $a; a=`expr $a + 1`; done )

# A-127-4 equipos del l133 al 186.
# el l133 es el del profesor
# l136-l148 son macs, por lo que los excluimos
A127_4=$(printf "l133 "; a=149; while [ $a -lt 187 ]; do printf "l%03d " $a; a=`expr $a + 1`; done )

# B-123-1 equipos del 056 al 100.
# el l056 es el del profesor
B123_1=$(a=56; while [ $a -lt 101 ]; do printf "l%03d " $a; a=`expr $a + 1`; done )

# B-123-2 equipos del 101 al 125.
# el l125 es el del profesor
B123_2=$(a=101; while [ $a -lt 126 ]; do printf "l%03d " $a; a=`expr $a + 1`; done )

# mac-minis del 134 al 148
MACS=$(printf "l130 l131 ";a=134; while [ $a -lt 149 ]; do printf "l%03d " $a; a=`expr $a + 1`; done )

A127=${A127_4}${A127_3}${A127_2}
B123=${B123_1}${B123_2}
PROFESORES="l056 l125 l133 l187 l221 "
REMOTO="l050 l051 l052 l053 l054 l055 "
LABORATORIO=${B123}${A127}
TODOS=${LABORATORIO}${REMOTO}${MACS}

#If no parameter provided, just echo nothing
[ -z $1 ] && $EXIT

# else just echo selected items
case $1 in
  "A127" | "a127" ) echo ${A127};;
  "A127_1" | "a127_1" ) echo ${A127_1};;
  "A127_2" | "a127_2" ) echo ${A127_2};;
  "A127_3" | "a127_3" ) echo ${A127_3};;
  "B123" | "b123" ) echo ${B123};;
  "B123_1" | "b123_1" ) echo ${B123_1};;
  "B123_2" | "b123_2" ) echo ${B123_2};;
  "MACS" | "macs" ) echo ${MACS};;
  "PROF*" | "prof*" ) echo ${PROFESORES};;
  "REM*" | "rem*" ) echo ${REMOTO};;
  "LAB*" | "lab*" ) echo ${LABORATORIO};;
  "TOD*" | "ALL" | "tod*" | "all" ) echo ${TODOS};;
  "EXC*" | "exc*" ) echo ${EXCLUDE};;
  * ) echo $* ;;
esac
