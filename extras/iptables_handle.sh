#!/bin/bash
#
# create/delete chain in iptables
#

IPTABLES=/usr/sbin/iptables
CURRENT=$(date +"%s")
LOGFILE=/var/log/labo_shpere.log

do_log() {
  a=$(date +"%Y-%m-%d %H:%M:%S")
  echo ${a} - $* >> ${LOGFILE}
}

die() {
  do_log $*
  exit 1
}

# command syntax
# iptables_handle create from to timeout
# iptables_handle delete from to
# iptables_handle crontab

# create_chain from to expire
create_chain() {
  # crear canal
  # programar canal
  # insertar canal en regla forward
}

# delete_chain name
delete_chain() {
  # borrar regla de canal forward
  # borrar reglas del canal
  # borrar canal
}

# crontab_chain
crontab_chain() {
  # enumerar reglas creadas con este script
  # en cada regla
    # si está expirada borrar regla
}

do_log("iptables_handle invoked with arguments $*")
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
  * ) die "Unknown command $1"
    ;;
esac
do_log("iptables_handle exit")
exit 0
