#!/bin/bash
#
# create/delete chain in iptables
# este programa se ejecuta en maestro3, bien desde linea de comandos,
# bien desde el cron
# substituye al antiguo "control_sesiones"
#

IPTABLES="/sbin/iptables"
SSH="ssh -q -n -x -o StrictHostKeyChecking=no"
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
  # cat ${IPTFILE} | ${SSH} router.lab
  cat ${IPTFILE}
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
  channel=$(get_chain_name $1 $2 $3)
  do_log "Create channel ${channel}"
  # crear canal
  echo "$IPTABLES -N ${channel}" >> ${IPTFILE}
  # programar canal
  echo "$IPTABLES -A $channel -p icmp -s $1 -d $2 --icmp-type 8/0 -m state --state NEW -j ACCEPT" >> ${IPTFILE}
  echo "$IPTABLES -A $channel -p icmp -s $1 -d $2 --icmp-type 5/1 -m state --state NEW -j ACCEPT" >> ${IPTFILE}
  # echo "-A $channel -p udp -s $1 -d $2 --destination-port 33434:33524 -m state --state NEW -j ACCEPT" >> ${IPTFILE}
  echo "$IPTABLES -A $channel -p tcp -s $1 -d $2 -m multiport --destination-port 22,5900 -j ACCEPT" >> ${IPTFILE}
  # insertar canal en regla forward
  echo "$IPTABLES -A FORWARD -s $1 -d $2 -m state --state NEW -j $channel" >> ${IPTFILE}
  # ejecutar script en router.lab
  send_iptables_cmd
}

# delete_chain name
delete_chain() {
  do_log "Deleting Channel $1"
  # borrar regla de canal forward
  src=`echo $1 | awk -F'_' '{ print strtonum("0x"$2) }'`
  dest=`echo $1 | awk -F'_' '{ print strtonum("0x"$3) }'`
  echo "$IPTABLES -D FORWARD -s $src -d $dest -m state --state NEW -j $1" >> ${IPTFILE}
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
