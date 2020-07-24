#!/bin/bash
#
# create/delete chain in iptables
# este programa se ejecuta en maestro3, bien desde linea de comandos,
# bien desde el cron
# substituye al antiguo "control_sesiones"
#

IPTABLES="/sbin/iptables"
SSH="ssh -q -x -o StrictHostKeyChecking=no"
CURRENT=$(date +"%s")
LOGFILE=/var/log/labo_sphere.log
IPTFILE=/tmp/iptables_handle.$$
do_log() {
  a=$(date +"%Y-%m-%d %H:%M:%S")
  echo ${a} - $* >> ${LOGFILE}
}

die() {
  do_log $*
  # rm -f ${IPTFILE}
  exit 1
}

# send composed filter command rulelist to router.lab and execute iptables with them
send_iptables_cmd() {
  cat ${IPTFILE} | ${SSH} router.lab
  #cat ${IPTFILE}
}

# command syntax
# iptables_handle create from to timeout
# iptables_handle delete from to
# iptables_handle crontab
# as iptables chain names cannot be longer than 30 characters, need some way to shrink name
get_chain_name() { # from to expire
  f=$(gethostip -x $1)
  t=$(gethostip -x $2)
  e=$(printf "%08X" $3)
  echo "Lab_${f}_${t}_${e}"
}

# create_chain from to expire
create_chain() {
  # extract vnc port from argument "to" ( eg l225->port 6100+225 )
  # port=`expr 6100 + ${2:1}`
  port=$(echo $2 | awk -F'.' '{print 6100+$4}')
  channel=$(get_chain_name $1 $2 $3)
  do_log "Create channel ${channel}"
  # crear canal
  echo "$IPTABLES -N ${channel}" >> ${IPTFILE}
  # programar canal
  # ping
  echo "$IPTABLES -A $channel -p icmp -s $1 -d $2 --icmp-type 8/0 -m state --state NEW -j ACCEPT" >> ${IPTFILE}
  # traceroute
  echo "$IPTABLES -A $channel -p icmp -s $1 -d $2 --icmp-type 5/1 -m state --state NEW -j ACCEPT" >> ${IPTFILE}
  # ssh vnc al host
  echo "$IPTABLES -A $channel -p tcp -s $1 -d $2 -m state --state NEW -m tcp --dport 22 -j ACCEPT" >> ${IPTFILE}
  # ssh/vnc websockets a acceso.lab.dit.upm.es
  echo "$IPTABLES -I FORWARD -p tcp -s $1 -d 138.4.30.120 -m state --state NEW -m multiport --destination-port 6001,$port -j ACCEPT" >> ${IPTFILE}
  # insertar canal en regla forward _al_principio_ de la regla forward, para hacer bypass del drop del final
  echo "$IPTABLES -I FORWARD -s $1 -d $2 -j $channel" >> ${IPTFILE}
  # ejecutar script en router.lab
  send_iptables_cmd
}

# delete_chain name
delete_chain() {
  do_log "Deleting Channel $1"
  # recuperamos las ips del nombre del canal
  src=`printf '%d.%d.%d.%d' $(echo $1 | awk -F'_' '{ print $2 }' | sed 's/../0x& /g' ) `
  dest=`printf '%d.%d.%d.%d' $(echo $1 | awk -F'_' '{ print $3 }' | sed 's/../0x& /g' ) `
  port=$(echo $dest | awk -F'.' '{print 6100+$4}')
  # borrar regla de canal forward
  echo "$IPTABLES -D FORWARD -p tcp -s $src -d 138.4.30.120 -m state --state NEW -m multiport --destination-port 6001,$port -j ACCEPT" >> ${IPTFILE}
  echo "$IPTABLES -D FORWARD -s $src -d $dest -j $1" >> ${IPTFILE}
  # borrar reglas del canal
  echo "$IPTABLES -F ${1}" >> ${IPTFILE}
  # borrar canal
  echo "$IPTABLES -X ${1}" >> ${IPTFILE}
  # ejecutar script en router.lab
  send_iptables_cmd
}

# locate channel matching from to
search_and_delete() {
  f=$(gethostip -x $1)
  t=$(gethostip -x $2)
  # enumerar reglas creadas con este script
  channels=`${SSH} router.lab.dit.upm.es iptables -L | grep -e "^Chain Lab_${f}_${t}_" | awk '{print $2 " "; }' `
  # las cadenas tienen el formato: Lab_fromhost_tohost_expiretime
  # donde las ips y el expire time están en formato hexadecimal
  for i in $channels; do
    delete_chain $i
  done
}

# crontab
# desde el crontab se debería ejecutar este comando cada media hora
crontab_chain() {
  # enumerar reglas creadas con este script
  channels=`${SSH} router.lab.dit.upm.es iptables -L | grep -e '^Chain Lab_' | awk '{print $2 " "; }'`
  # las cadenas tienen el formato: Lab_fromhost_tohost_expiretime
  # donde las ips y el expire time están en formato hexadecimal
  for i in $channels; do
    expire=$(echo $i | awk -F'_' '{ print strtonum("0x"$4) }')
    # si está expirada borrar regla
    [ $expire -lt $CURRENT ] && delete_chain $i
  done
}

do_log "iptables_handle invoked with arguments $*"
cp /dev/null ${IPTFILE}
case $1 in
  "create" )
    expire=`expr ${CURRENT} + $4`
    create_chain $2 $3 $expire
    ;;
  "delete" )
    search_and_delete $2 $3
    ;;
  "crontab" )
    crontab_chain
    ;;
  "help" | "-h" | "--help" | "-?" )
    echo "Usage:"
    echo "  $0 create from_host to_host timeout(secs)  Create new channel"
    echo "  $0 delete from_host to_host                Delete channel"
    echo "  $0 crontab                                 Take care on channel expiration"
    echo ""
    ;;
  * ) die "Unknown command $1"
    ;;
esac
rm -f ${IPTFILE}
do_log "iptables_handle exit"
exit 0
