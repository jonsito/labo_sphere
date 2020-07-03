#!/bin/bash
#
# create/delete chain in iptables
# este programa se ejecuta en maestro3, bien desde linea de comandos,
# bien desde el cron
# substituye al antiguo "control_sesiones"
#

IPTABLES="/usr/sbin/iptables"
SSH="ssh -q -n -x -o StrictHostKeyChecking=no"
CURRENT=$(date +"%s")
LOGFILE=/var/log/labo_shpere.log
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
}

# command syntax
# iptables_handle create from to timeout
# iptables_handle delete from to
# iptables_handle crontab

# create_chain from to expire
create_chain() {
  channel="LabDit_${1}_${2}_${3}"
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
  src=`echo $1 | awk -F'_' '{ print $2 }'`
  dest=`echo $1 | awk -F'_' '{ print $3 }'`
  echo "$IPTABLES -D FORWARD -s $src -d $dest -m state --state NEW -j $1" >> ${IPTFILE}
  # borrar reglas del canal
  echo "$IPTABLES -F ${1}" >> ${IPTFILE}
  # borrar canal
  echo "$IPTABLES -X ${1}" >> ${IPTFILE}
  # ejecutar script en router.lab
  send_iptables_cmd
}

# crontab
# desde el crontab se debería ejecutar este comando cada media hora
crontab_chain() {
  # enumerar reglas creadas con este script
  channels=`${SSH} router.lab.dit.upm.es iptables -L | grep -e '^Chain LabDit_' | awk '{print $2 " "; }'`
  # las cadenas tienen el formato: LabDit_fromhost_tohost_expiretime
  for i in channels; do
    expire=`echo $i | awk -F'_' '{print $4}'`
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
    delete_chain $2 $3
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
