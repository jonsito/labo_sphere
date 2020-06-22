#!/bin/bash

# Este script se ejecuta en maestro3
# en lugar de permitir controlar los equipos desde acceso.lab lo que vamos a hacer es
# centralizar las tareas en maestro, de manera que haya una única máquina que controle
# adicionalmente esto evita problemas de seguriddd, pues en maestro podemos restringir
# a este script los comandos que se pueden ejecutar desde acceso.lab via ssh

BASE=/data/maestro3-labadmin/servicios_ubuntu-18.04
REPORT=/var/log/labo_sphere.log
STATUS_FILE=${BASE}/estado_clientes.log

source ${BASE}/lista_maquinas
# buscar un equipo apagado de la zona deseada y encenderlo
# parametro: zona
find_freehost() {
  lista=""
  case $1 in
    "laboA" ) lista="${A127}" ;;
    "laboB" ) lista="${B123}" ;;
    "virtual" ) lista="${REMOTO}" ;;
    "macs" ) lista="${MACS}" ;;
    * ) echo ""; return ;;
  esac
  #cogemos lista de equipos del grupo escogido
  cp /dev/null /tmp/find_freehost.$$
  for i in $lista; do
    grep "Client:$i" ${STATUS_FILE} >> /tmp/find_freehost.$$
  done
  # ordenamos segun numero encendido + ocupacion y cogemos el primero
  equipo=`sed -e 's/Client://g' -e 's/ State:/ /g' -e 's/ Server:[b-].* Users:/ /g' /tmp/find_freehost.$$ | sort -k 2 | head -1 | awk '{ print $1 }'`
  rm -f /tmp/find_freehost.$$
  # retornamos equipo seleccionado
  echo $equipo
  return
}

# arranca un servidor vnc en
fire_vncserver() {
  echo ""
}

# programa en el firewall un tunel ssh
fire_sshtunnel() { # $1:source $2:destination
  echo ""
}

bgjob() {
  $* 2>&1 >>${REPORT} &
}

case $1 in
  "start" ) # "start host|alias|list"
      host=$2
      bgjob /usr/local/bin/wakeup.sh -q $2
    ;;
  "stop" ) # "stop host|alias|list"
      bgjob /usr/local/bin/apagamaq.sh -q $2
    ;;
  "status" ) # "stop host|alias|list"
      bgjob /usr/local/bin/compruebamaq.sh -q $2
    ;;
  "ssh_console" ) # zone
      # locate free host
      host=$(find_freehost $2)
      # wake up selected host
      bgjob /usr/local/bin/wakeup.sh -q $host
      # return #return wss://acceso.lab.dit.upm.es:6001/host:22
      sleep 10
      echo "wss://acceso.lab.dit.upm.es:6001/${host}:22"
      ;;
  "vnc_console" ) # user zone
      # locate free host
      host=$(find_freehost $2)
      # wake up selected host
      bgjob /usr/local/bin/wakeup.sh -q $host
      sleep 10
      # create vnc server with session for user@host ( passwd='conectar' )
      port=ssh $host "echo $user conectar "
      # return wss://acceso.lab.dit.upm.es:wsport/host:vncport
      echo "wss://acceso.lab.dit.upm.es:6001/${host}:${port}"
      ;;
  "tunnel" ) # zone
      # locate free host
      host=$(find_freehost $2)
      # wake up selected host
      bgjob /usr/local/bin/wakeup.sh -q $host
      # create tunnel in firewall
      # return command to execute
  ;;
  "poll" )
    /usr/local/bin/informemaq.sh -q remoto laboratorios macs
  ;;
  "help" )
      bgjob echo "hola mundo"
    ;;
    * )
     echo "invalid command:$1"
    ;;
esac
