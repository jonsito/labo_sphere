#!/bin/bash

# Este script se ejecuta en maestro3
# en lugar de permitir controlar los equipos desde acceso.lab lo que vamos a hacer es
# centralizar las tareas en maestro, de manera que haya una única máquina que controle
# adicionalmente esto evita problemas de seguriddd, pues en maestro podemos restringir
# a este script los comandos que se pueden ejecutar desde acceso.lab via ssh
REPORT=/var/log/labo_sphere.log

# buscar un equipo apagado de la zona deseada y encenderlo
# parametro: zona
find_freehost() {

}

# arranca un servidor vnc en
fire_vncserver() {

}

# programa en el firewall un tunel ssh
fire_sshtunnel() { # $1:source $2:destination

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
      host=$(find_freehost $1)
      # wake up selected host
      bgjob /usr/local/bin/wakeup.sh -q $2
      # return #return wss://acceso.lab.dit.upm.es:6001/host:22
      ;;
  "vnc_console" ) # user zone
      # locate free host
      host=$(find_freehost $2)
      # wake up selected host
      bgjob /usr/local/bin/wakeup.sh -q $2
      # create vnc server with session for user@host ( passwd='conectar' )
      port=ssh $host "echo $user conectar "
      # return wss://acceso.lab.dit.upm.es:wsport/host:vncport
      ;;
  "tunnel" ) # zone
      # locate free host
      host=$(find_freehost $2)
      # wake up selected host
      bgjob /usr/local/bin/wakeup.sh -q $2
      # create tunnel in firewall
      # return command to execute
  ;;
  "poll" )
  ;;
  "help" )
      bgjob echo "hola mundo"
    ;;
    * )
     echo "invalid command:$1"
    ;;
esac