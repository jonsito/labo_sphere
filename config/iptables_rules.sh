#!/bin/bash 
#

log() {
  test -x "$LOGGER" && $LOGGER -p info "$1"
}

va_num=1
add_addr() {
  addr=$1
  nm=$2
  dev=$3

  type=""
  aadd=""

  L=`$IP -4 link ls $dev | grep "$dev:"`
  if test -n "$L"; then
    OIFS=$IFS
    IFS=" /:,<"
    set $L
    type=$4
    IFS=$OIFS

    L=`$IP -4 addr ls $dev to $addr | grep " inet "`
    if test -n "$L"; then
      OIFS=$IFS
      IFS=" /"
      set $L
      aadd=$2
      IFS=$OIFS
    fi
  fi
  if test -z "$aadd"; then
    if test "$type" = "POINTOPOINT"; then
      $IP -4 addr add $addr dev $dev scope global label $dev:FWB${va_num}
      va_num=`expr $va_num + 1`
    fi
    if test "$type" = "BROADCAST"; then
      $IP -4 addr add $addr/$nm dev $dev brd + scope global label $dev:FWB${va_num}
      va_num=`expr $va_num + 1`
    fi
  fi
}

getaddr() {
  dev=$1
  name=$2
  L=`$IP -4 addr show dev $dev | grep inet`
  test -z "$L" && { 
    eval "$name=''"
    return
  }
  OIFS=$IFS
  IFS=" /"
  set $L
  eval "$name=$2"
  IFS=$OIFS
}


getinterfaces() {
  NAME=$1
  $IP link show | grep -E "$NAME[^ ]*: "| while read L; do
    OIFS=$IFS
    IFS=" :"
    set $L
    IFS=$OIFS
    echo $2
  done
}

LSMOD="/sbin/lsmod"
MODPROBE="/sbin/modprobe"
IPTABLES="/sbin/iptables"
IP="/sbin/ip"
LOGGER="/usr/bin/logger"

cd /etc || exit 1

log "Activating firewall script generated Fri Jul 10 10:13:01 CEST 2020 by control_sesiones"

echo 1 > /proc/sys/net/ipv4/conf/all/rp_filter
echo 0 > /proc/sys/net/ipv4/conf/all/accept_source_route
echo 0 > /proc/sys/net/ipv4/conf/all/accept_redirects
echo 1 > /proc/sys/net/ipv4/conf/all/log_martians
echo 1 > /proc/sys/net/ipv4/icmp_echo_ignore_broadcasts
echo 0 > /proc/sys/net/ipv4/icmp_echo_ignore_all
echo 1 > /proc/sys/net/ipv4/icmp_ignore_bogus_error_responses
echo 30 > /proc/sys/net/ipv4/tcp_fin_timeout
echo 1800 > /proc/sys/net/ipv4/tcp_keepalive_intvl

$IP -4 neigh flush dev eth1 > /dev/null 2>&1
$IP -4 addr flush dev eth1 label "eth1:FWB*" > /dev/null 2>&1
$IP -4 neigh flush dev eth0 > /dev/null 2>&1
$IP -4 addr flush dev eth0 label "eth0:FWB*" > /dev/null 2>&1
$IP -4 neigh flush dev eth0.574 > /dev/null 2>&1
$IP -4 addr flush dev eth0.574 label "eth0.574:FWB*" > /dev/null 2>&1
$IP -4 neigh flush dev eth0.578 > /dev/null 2>&1
$IP -4 addr flush dev eth0.578 label "eth0.578:FWB*" > /dev/null 2>&1
$IP -4 neigh flush dev eth0.579 > /dev/null 2>&1
$IP -4 addr flush dev eth0.579 label "eth0.579:FWB*" > /dev/null 2>&1

add_addr 127.0.0.1 8 lo
$IP link set lo up
add_addr 138.4.26.2 26 eth1
$IP link set eth1 up
add_addr 138.4.30.1 23 eth0
$IP link set eth0 up
add_addr 138.4.28.1 24 eth0.574
$IP link set eth0.574 up
add_addr 138.4.27.1 24 eth0.578
$IP link set eth0.578 up
add_addr 138.4.18.1 24 eth0.579
$IP link set eth0.579 up

#
# establece la politica por defecto en ACCEPT
#
$IPTABLES -P OUTPUT  ACCEPT
$IPTABLES -P INPUT   ACCEPT
$IPTABLES -P FORWARD ACCEPT

#
# limpia las iptable chains pre-existentes
#
cat /proc/net/ip_tables_names | while read table; do
  $IPTABLES -t $table -L -n | while read c chain rest; do
      if test "X$c" = "XChain" ; then
        $IPTABLES -t $table -F $chain > /dev/null 2>&1
      fi
  done
  $IPTABLES -t $table -X
done

#
# carga los diversos modulos de filtros del kernel (1)
#
MODULE_DIR="/lib/modules/`uname -r`/kernel/net/netfilter/" 
MODULES=`(cd $MODULE_DIR; ls *_conntrack_*  | sed 's/\.ko.*$//')`
for module in $(echo $MODULES); do 
  if $LSMOD | grep ${module} >/dev/null; then continue; fi
  if [ -e "${MODULE_DIR}/${module}.ko" -o -e "${MODULE_DIR}/${module}.ko.gz" ]; then 
    $MODPROBE ${module} ||  exit 1 
  fi 
done

#
# carga los diversos modulos de filtros del kernel (2)
#
MODULE_DIR="/lib/modules/`uname -r`/kernel/net/ipv4/netfilter/" 
MODULES=`(cd $MODULE_DIR; ls *_nat_*  | sed 's/\.ko.*$//')`
for module in $(echo $MODULES); do 
  if $LSMOD | grep ${module} >/dev/null; then continue; fi
  if [ -e "${MODULE_DIR}/${module}.ko" -o -e "${MODULE_DIR}/${module}.ko.gz" ]; then 
    $MODPROBE ${module} ||  exit 1 
  fi 
done

#
# mantiene las conexiones que ya estuvieran establecidas
#
$IPTABLES -A INPUT   -m state --state ESTABLISHED,RELATED -j ACCEPT
$IPTABLES -A OUTPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT
$IPTABLES -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT

#
# Aceptamos cualquier conexion desde NAGIOS y ADMIN incluyendo ICMP
#
$IPTABLES -A FORWARD  -s 138.4.5.147 -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD  -s 138.4.5.17  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD  -s 138.4.5.7   -m state --state NEW  -j ACCEPT

#
# Pruebas con los pcs de Hector y Gabi
#
$IPTABLES -A FORWARD  -s 138.4.4.80   -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD  -s 138.4.4.66   -m state --state NEW  -j ACCEPT

#
# Aceptamos cualquier conexion snmp sobre UDP desde CACTI
#
$IPTABLES -A FORWARD -p udp -s 138.4.5.226 -m multiport --destination-port 161 -m state --state NEW  -j ACCEPT

#
# Permitir el acceso al moodle del laboratorio
# JAMC cerrado desde Agosto 2020
#
# $IPTABLES -A FORWARD -p tcp -d 138.4.30.27 -m multiport --destination-port 80,443 -m state --state NEW  -j ACCEPT

#
# red 17 con todas las demás (17, 18, 26, 27, 28, 30)
# entrante hacia la red 17
$IPTABLES -A FORWARD -s 138.4.30.0/23 -d 138.4.17.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.28.0/24 -d 138.4.17.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/24 -d 138.4.17.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/24 -d 138.4.17.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/24 -d 138.4.17.0/26   -m state --state NEW -j ACCEPT
# saliente desde la red 17
$IPTABLES -A FORWARD -s 138.4.17.0/26 -d 138.4.30.0/23   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/26 -d 138.4.28.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/26 -d 138.4.27.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/26 -d 138.4.26.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/26 -d 138.4.18.0/24   -m state --state NEW -j ACCEPT

#
# red 18 con todas las demás (17, 18, 26, 27, 28, 30)
# entrante hacia la red 18
$IPTABLES -A FORWARD -s 138.4.30.0/23 -d 138.4.18.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.28.0/24 -d 138.4.18.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/24 -d 138.4.18.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/24 -d 138.4.18.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/24 -d 138.4.18.0/26   -m state --state NEW -j ACCEPT
# saliente desde la red 18
$IPTABLES -A FORWARD -s 138.4.18.0/26 -d 138.4.30.0/23   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/26 -d 138.4.28.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/26 -d 138.4.27.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/26 -d 138.4.26.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/26 -d 138.4.17.0/24   -m state --state NEW -j ACCEPT

#
# red 26 con todas las demás (17, 18, 26, 27, 28, 30)
# entrante hacia la red 26
$IPTABLES -A FORWARD -s 138.4.30.0/23 -d 138.4.26.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.28.0/24 -d 138.4.26.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/24 -d 138.4.26.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/24 -d 138.4.26.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/24 -d 138.4.26.0/26   -m state --state NEW -j ACCEPT
# saliente desde la red 26
$IPTABLES -A FORWARD -s 138.4.26.0/26 -d 138.4.30.0/23   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/26 -d 138.4.28.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/26 -d 138.4.27.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/26 -d 138.4.18.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/26 -d 138.4.17.0/24   -m state --state NEW -j ACCEPT

#
# red 27 con todas las demás (17, 18, 26, 27, 28, 30)
# entrante hacia 27
$IPTABLES -A FORWARD -s 138.4.30.0/23 -d 138.4.27.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.28.0/24 -d 138.4.27.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/24 -d 138.4.27.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/24 -d 138.4.27.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/24 -d 138.4.27.0/26   -m state --state NEW -j ACCEPT
# saliente desde 27
$IPTABLES -A FORWARD -s 138.4.27.0/26 -d 138.4.30.0/23   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/26 -d 138.4.28.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/26 -d 138.4.26.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/26 -d 138.4.18.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/26 -d 138.4.17.0/24   -m state --state NEW -j ACCEPT

#
# red 28 con todas las demás (17, 18, 26, 27, 28, 30)
# entrante hacia 28
$IPTABLES -A FORWARD -s 138.4.30.0/23 -d 138.4.28.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/24 -d 138.4.28.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/24 -d 138.4.28.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/24 -d 138.4.28.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/24 -d 138.4.28.0/26   -m state --state NEW -j ACCEPT
# saliente desde 28
$IPTABLES -A FORWARD -s 138.4.28.0/26 -d 138.4.30.0/23   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.28.0/26 -d 138.4.27.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.28.0/26 -d 138.4.26.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.28.0/26 -d 138.4.18.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.28.0/26 -d 138.4.17.0/24   -m state --state NEW -j ACCEPT

#
# red 30 con todas las demás (17, 18, 26, 27, 28, 30)
# entrante hacia 30
$IPTABLES -A FORWARD -s 138.4.28.0/24 -d 138.4.30.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.27.0/24 -d 138.4.30.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.26.0/24 -d 138.4.30.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.18.0/24 -d 138.4.30.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.17.0/24 -d 138.4.30.0/26   -m state --state NEW -j ACCEPT
# saliente desde 30
$IPTABLES -A FORWARD -s 138.4.30.0/26 -d 138.4.28.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.30.0/26 -d 138.4.27.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.30.0/26 -d 138.4.26.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.30.0/26 -d 138.4.18.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -s 138.4.30.0/26 -d 138.4.17.0/24   -m state --state NEW -j ACCEPT

#
# Permitir acceso traceroute (ping/traceroute) desde las redes del labo
# red 30
$IPTABLES -A FORWARD -p icmp -s 138.4.30.0/23   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -s 138.4.30.0/23   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -p icmp -d 138.4.30.0/23   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -d 138.4.30.0/23   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
# red 28
$IPTABLES -A FORWARD -p icmp -s 138.4.28.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -s 138.4.28.0/24   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -p icmp -d 138.4.28.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -d 138.4.28.0/24   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
#red 27
$IPTABLES -A FORWARD -p icmp -s 138.4.27.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -s 138.4.27.0/24   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -p icmp -d 138.4.27.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -d 138.4.27.0/24   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
# red 26
$IPTABLES -A FORWARD -p icmp -s 138.4.26.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -s 138.4.26.0/26   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -p icmp -d 138.4.26.0/26   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -d 138.4.26.0/26   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
# red 18
$IPTABLES -A FORWARD -p icmp -s 138.4.18.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -s 138.4.18.0/24   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -p icmp -d 138.4.18.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -d 138.4.18.0/24   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
# red 17
$IPTABLES -A FORWARD -p icmp -s 138.4.17.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -s 138.4.17.0/24   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -p icmp -d 138.4.17.0/24   -m state --state NEW -j ACCEPT
$IPTABLES -A FORWARD -p udp  -d 138.4.17.0/24   --destination-port 33434:33524  -m state --state NEW  -j ACCEPT

#
# Regla especial para el forwarding de http y nfs para la red de NIMBO, NIMBO4 y ftel
#
$IPTABLES -A FORWARD -p tcp  -d 138.4.17.0/24   -m multiport --destination-port 80,111,443,2049  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -p tcp  -d 138.4.18.0/24   -m multiport --destination-port 80,111,443,2049 -m state --state NEW  -j ACCEPT

#
# Regla especial para el forwarding de nfs para la red de NIMBO, NIMBO4 y ftel
#
$IPTABLES -A FORWARD -p udp  -d 138.4.17.0/24   -m multiport --destination-port 111,2049  -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -p udp  -d 138.4.18.0/24   -m multiport --destination-port 111,2049  -m state --state NEW  -j ACCEPT

#
# Regla de NAT para permitir el acceso desde el laboratorio a cache-ubuntu sin proxy
#
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.30.0/23 -d cache-ubuntu.dit.upm.es -m multiport --destination-port 3142 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.28.0/24 -d cache-ubuntu.dit.upm.es -m multiport --destination-port 3142 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.27.0/24 -d cache-ubuntu.dit.upm.es -m multiport --destination-port 3142 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.18.0/24 -d cache-ubuntu.dit.upm.es -m multiport --destination-port 3142 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.17.0/24 -d cache-ubuntu.dit.upm.es -m multiport --destination-port 3142 -j MASQUERADE

#
# Regla de NAT para permitir el acceso desde el laboratorio al DNS de google 
#
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.30.0/23 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.28.0/24 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.27.0/24 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.18.0/24 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.17.0/24 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE

$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.30.0/23 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.28.0/24 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.27.0/24 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.18.0/24 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.17.0/24 -d 8.8.8.8 -m multiport --destination-port 53 -j MASQUERADE

$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.30.0/23 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.28.0/24 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.27.0/24 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.18.0/24 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p tcp -s 138.4.17.0/24 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE

$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.30.0/23 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.28.0/24 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.27.0/24 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.18.0/24 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE
$IPTABLES -t nat -A POSTROUTING -o eth1 -p udp -s 138.4.17.0/24 -d 8.8.4.4 -m multiport --destination-port 53 -j MASQUERADE

#
# Regla de forwarding para permitir el acceso a múltiples puertos de internet sin proxy ni nat
# Aniadimos puerto de git(9418) y puerto 5000 a peticion de Santiago Pavon
#
$IPTABLES -A FORWARD -o eth1 -p tcp -s 138.4.30.0/23  ! -d 138.4.26.0/26 -m multiport --destination-port 20,21,80,443,563,873,2376,2443,5000,8000,8080,9418 -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -o eth1 -p tcp -s 138.4.28.0/24  ! -d 138.4.26.0/26 -m multiport --destination-port 20,21,80,443,563,873,2376,2443,5000,8000,8080,9418 -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -o eth1 -p tcp -s 138.4.27.0/24  ! -d 138.4.26.0/26 -m multiport --destination-port 20,21,80,443,563,873,2376,2443,5000,8000,8080,9418 -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -o eth1 -p tcp -s 138.4.18.0/24  ! -d 138.4.26.0/26 -m multiport --destination-port 20,21,80,443,563,873,2376,2443,5000,8000,8080,9418 -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -o eth1 -p tcp -s 138.4.17.0/24  ! -d 138.4.26.0/26 -m multiport --destination-port 20,21,80,443,563,873,2376,2443,5000,8000,8080,9418 -m state --state NEW  -j ACCEPT

#
# Regla de forwarding para permitir el acceso al puerto SSH de los mac del laboratorio.
#
$IPTABLES -A FORWARD -o eth0 -p tcp -d 138.4.31.137/32  -m multiport --destination-port 22 -m state --state NEW  -j ACCEPT

#
# Regla para permitir el acceso a gmail puerto 465 para que scrum pueda enviar correo por ahi -- omar@dit a peticion de beatriz san miguel
#
$IPTABLES -A FORWARD -o eth1 -p tcp -s 138.4.30.35/32  -m multiport --destination-port 465 -m state --state NEW  -j ACCEPT
$IPTABLES -A FORWARD -o eth1 -p tcp -m multiport --destination-port 465 -m state --state NEW  -j LOG --log-ip-options --log-tcp-options --log-prefix "Trafico smtp no autorizado: "
$IPTABLES -A FORWARD -o eth1 -p tcp -m multiport --destination-port 465 -m state --state NEW  -j DROP

#
# Reglas para permitir el acceso pop3/ssl desde ldap-ng.lab.dit.upm.es a correo.upm.es y correo.alumnos.upm.es ( autenticacion de cuentas )
#
# correo.alumnos.upm.es
$IPTABLES -A FORWARD -o eth1 -p tcp -s 138.4.30.21/32  -d 138.100.4.175/32 --dport 995 -m state --state NEW  -j ACCEPT
# correo.upm.es
$IPTABLES -A FORWARD -o eth1 -p tcp -s 138.4.30.21/32  -d 138.100.198.136/32 --dport 995 -m state --state NEW  -j ACCEPT

#
# Regla de forwarding para permitir el acceso al puerto SNMP de los servidores de demo.snmplabs.com 104.236.166.95
#
$IPTABLES -A FORWARD -o eth1 -p udp -s 138.4.30.0/23   -d 104.236.166.95/32 -m multiport --destination-port 161 -m time --timestart 08:00 --timestop 22:00 --weekdays Mon,Tue,Wed,Thu,Fri -m state --state NEW  -j ACCEPT

#
# Drop trafico POP3 y SNMP no autorizado
#
$IPTABLES -A FORWARD -o eth1 -p tcp -m multiport --destination-port 995 -m state --state NEW  -j LOG --log-ip-options --log-tcp-options --log-prefix "Trafico POP3S no autorizado: "
$IPTABLES -A FORWARD -o eth1 -p tcp -m multiport --destination-port 995 -m state --state NEW  -j DROP

$IPTABLES -A FORWARD -o eth1 -p udp -m multiport --destination-port 161 -m state --state NEW  -j LOG --log-ip-options --log-tcp-options --log-prefix "Trafico snmp no autorizado: "
$IPTABLES -A FORWARD -o eth1 -p udp -m multiport --destination-port 161 -m state --state NEW  -j DROP

# Fin cabecera

#
# Labo_sphere: por defecto bloquea todo el tráfico ssh/vnc
# que no venga del dit y tenga como destino la red del labo
#
# Esta regla será sobreescrita desde el software de control de accesos
# anyadiendo canales nuevos específicos para cada sesion al principio de la cadena FORWARD
#
# Substituye al antiguo bloqueo de los servidores de acceso remoto de "control_sesiones", 
# cambiandolo por una regla general que abarque a todo el laboratorio
$IPTABLES -A FORWARD -s ! 138.4.0.0/16 -d 138.4.30.0/23 -p tcp -m multiport --destination-port 22,5900 -m state --state NEW  -j LOG --log-ip-options --log-tcp-options --log-prefix "Trafico acceso remoto sin abrir canal: "
$IPTABLES -A FORWARD -s ! 138.4.0.0/16 -d 138.4.30.0/23 -p tcp -m multiport --destination-port 22,5900 -m state --state NEW  -j DROP

# Fin de control sesiones

#
# finalmente, se habilita el ipv4 forwarding
#
echo 1 > /proc/sys/net/ipv4/ip_forward
