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

do_log() {
  a=$(date +"%Y-%m-%d %H:%M:%S")
  echo ${a} - $* >> ${REPORT}
}

# buscar un equipo apagado de la zona deseada y encenderlo
# parametro: zona host
find_freehost() {
  if [ "Z$2" != "Znone" ]; then echo $2; return; fi
  lista=""
  case $1 in
    "laboA" ) lista="${A127}" ;;
    "laboB" ) lista="${B123}" ;;
    "virtual" ) lista="${REMOTO}" ;;
    "macs" ) lista="${MACS}" ;;
    * ) echo ""; return ;;
  esac
  #cogemos lista de equipos del grupo escogido
  # y los barajamos para:
  # - minimizar las posibilidades de asignar una maquina estropeada
  # - maximizar el reparto de carga en la alimentación de los equipos
  cp /dev/null /tmp/find_freehost.$$
  for i in $lista; do
    grep "Client:$i" ${STATUS_FILE} | shuf >> /tmp/find_freehost.$$
  done
  # cogemos el fichero y buscamos el primer equipo encendido y sin usuarios
  equipo=`cat /tmp/find_freehost.$$ | grep -e 'State:UP Server:.*Users:-$' | sed -e 's/Client:\(.*\) State.*/\1/g' | head -1`
  echo "fireup $zona. Seleccionado host $equipo" >> ${REPORT}
  # si hemos encontrado un equipo valido cogemos ademas otro equipo apagado
  # si no, cogemos dos equipos equipos apagados
  down=`cat /tmp/find_freehost.$$ | grep -e 'State:DOWN Server:- Users:-$' | sed -e 's/Client:\(.*\) State.*/\1/g' | head -2`
  # damos la orden de encender los equipos seleccionados.
  # lo normal es que uno de ellos este ya encendido, pero vamos, el wakeup es gratis
  echo "fireup $zona. Encendiendo host(s): $equipo" >> ${REPORT}
  /usr/local/bin/wakeup.sh $equipo $down
  if [ $? -ne 0 ]; then
    # si llega aqui es que no hay equipos ni vacios ni apagados
    # cogemos pues los tres primeros disponibles de la lista (recordar que era aleatoria )
    # y a rezar para que no tengan demasiados usuarios
    equipo=""
    down=`cat /tmp/find_freehost.$$ | sed -e 's/Client:\(.*\) State.*/\1/g' | head -3`
  fi
  # retornamos el primer equipo seleccionado.
  # como $equipo puede ser null, anyadimos a la lista los down para que siempre haya algun equipo a devolver
  echo $equipo $down | awk '{ print $1 }'
  rm -f /tmp/find_freehost.$$
  return
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
  "status" ) # "stop host|alias|list"
      bgjob /usr/local/bin/compruebamaq.sh -q $2
    ;;
  # actualmente ssh_console, vnc_console y tunnel hacen lo mismo
  # salvo el puerto que se devuelve ( que no se utiliza )
  # los pongo separados por si esto cambia en un futuro
  "ssh_console" ) # zone host
      # locate free host
      host=$(find_freehost $2 $3)
      # wake up selected host. if already alive, set wait delay to zero
      bgjob /usr/local/bin/wakeup.sh -q $host
      delay=$(isAlive $host)
      [ $delay -ne 0 ] && delay=90
      # return #return wss://acceso.lab.dit.upm.es:6001/host:22
      echo "{\"host\":\"${host}\",\"delay\":${delay},\"port\":22}";
      ;;
  "vnc_console" ) # zone host
      # locate free host
      host=$(find_freehost $2 $3)
      # wake up selected host. if already alive, set wait delay to zero
      bgjob /usr/local/bin/wakeup.sh -q $host
      delay=$(isAlive $host)
      [ $delay -ne 0 ] && delay=90
      # create vnc server with session for user@host ( passwd='conectar' )
      # port=6100+host
      port=$(expr 6100 + `echo $host | sed -e 's/l//g'`)
      # echo "wss://acceso.lab.dit.upm.es:6001/${host}:${port}"
      fireup_websockify $host $port 2>&1 >>${REPORT}
      echo "{\"host\":\"${host}\",\"delay\":${delay},\"port\":${port}}";
      ;;
  "tunnel" ) # zone host from timeout
      # locate free host
      host=$(find_freehost $2 $3)
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
