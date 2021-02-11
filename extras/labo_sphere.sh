#!/bin/bash

# Este script se ejecuta en maestro3
# en lugar de permitir controlar los equipos desde acceso.lab lo que vamos a hacer es
# centralizar las tareas en maestro, de manera que haya una única máquina que controle
# adicionalmente esto evita problemas de seguriddd, pues en maestro podemos restringir
# a este script los comandos que se pueden ejecutar desde acceso.lab via ssh

BASE=/data/maestro3-labadmin/servicios_ubuntu-18.04
REPORT=/var/log/labo_sphere.log
STATUS_FILE=${BASE}/estado_clientes.log
FIND_FREEHOST=/home/operador/administracion/servicios_ubuntu-18.04/tools/find_freehost.php

do_log() {
  a=$(date +"%Y-%m-%d %H:%M:%S")
  echo ${a} - $* >> ${REPORT}
}

# zone host timeout user
find_freehost() {
  if [ "Z$2" != "Znone" ]; then echo $2; return; fi
  php -f ${FIND_FREEHOST} $1 $3 $4
}

# arranca un servidor vnc en $1:host $2:port
# es necesario ejecutar este comando como root en acceso,
# por lo que lo tenemos que hacer desde aquí
fireup_websockify() {
  ssh acceso.lab.dit.upm.es "netstat -ant | grep -q ${2} || websockify --daemon --idle-timeout 300 --cert /etc/ssl/certs/acceso.lab.dit.upm.es.certificado.pem --key /etc/ssl/private/acceso.lab.dit.upm.es.llave.pem --ssl-only ${2} ${1}.lab.dit.upm.es:5900 2>&1 >/dev/null"
}

# programa en el firewall un tunel ssh
fire_tunnel() { # $1:source $2:destination $3:timeout
  ${BASE}/tools/iptables_handle.sh create $1 $2 $3
}

stop_tunnel() {  # $1:source $2:destination
  ${BASE}/tools/iptables_handle.sh delete $1 $2
}

bgjob() {
  do_log "launch bgjob $*"
  $* 2>&1 >>${REPORT} &
}

isAlive() {
  # use 22 (ssh) or 111 (rpcbind)
  nc -4 -z $1 22
  echo $?
}

do_log "labo_sphere.sh started. args: $*"
case $1 in
  "start" ) # "start host|alias|list"
      host=$2
      bgjob /usr/local/bin/wakeup.sh -q $2
    ;;
  "stop" ) # "stop host|alias|list"
      bgjob /usr/local/bin/apagamaq.sh -q $2
    ;;
  "restart" ) # "restart host|alias|list"
      bgjob /usr/local/bin/apagamaq.sh --reboot -q $2
    ;;
  "status" ) # "stop host|alias|list"
      bgjob /usr/local/bin/compruebamaq.sh -q $2
    ;;
  "kill" ) # "kill active sessions in host" (except root :-) )
      users=`ssh $2 who | grep -v root | awk '{ print $1}'`
      for i in $users; do ssh $2 pkill -KILL -u $i; done
    ;;
  # actualmente ssh_console, vnc_console y tunnel hacen lo mismo
  # salvo el puerto que se devuelve ( que no se utiliza )
  # los pongo separados por si esto cambia en un futuro
  "ssh_console" ) # ssh_console zone host remote_addr timeout user
      # locate free host
      host=$(find_freehost $2 $3 $5 $6)
      # wake up selected host. if already alive, set wait delay to zero
      bgjob /usr/local/bin/wakeup.sh -q $host
      delay=$(isAlive $host)
      [ $delay -ne 0 ] && delay=90
      # return #return wss://acceso.lab.dit.upm.es:6001/host:22
      echo "{\"host\":\"${host}\",\"delay\":${delay},\"port\":22}";
      ;;
  "vnc_console" ) # vnc_console zone host remote_addr timeout user
      # locate free host
      host=$(find_freehost $2 $3 $5 $6)
      # wake up selected host. if already alive, set wait delay to zero
      bgjob /usr/local/bin/wakeup.sh -q $host
      delay=$(isAlive $host)
      [ $delay -ne 0 ] && delay=90
      # create vnc server with session for user@host ( passwd='conectar' )
      # port=6100+host
      port=$(expr 6100 + `echo $host | sed -e 's/l//g'`)
      # echo "wss://acceso.lab.dit.upm.es:6001/${host}:${port}"
      do_log "fireup websockify $host $port returns:"
      fireup_websockify $host $port 2>&1 >>${REPORT}
      echo "{\"host\":\"${host}\",\"delay\":${delay},\"port\":${port}}";
      ;;
  "tunnel" ) # tunnel zone host remote_addr timeoutt user
      # locate free host
      host=$(find_freehost $2 $3 $5 $6)
      do_log "find_freehost returns ${host}"
      iphost=$(host -t a $host | awk '{ print $NF }')
      # wake up selected host.  if already alive, set wait delay to zero
      bgjob /usr/local/bin/wakeup.sh -q $host
      delay=$(isAlive $host)
      [ $delay -ne 0 ] && delay=90
      # create tunnel and return data
      if [ $5 -ne 0 ]; then
        fire_tunnel $4 $iphost $5
      else
        stop_tunnel $4 $iphost $5
      fi
      echo "{\"host\":\"${host}\",\"delay\":${delay},\"port\":22}";
    ;;
  "stop_tunnel" ) # host from
      stop_tunnel $3 $2
      echo "{\"host\":\"$2\"}";
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
