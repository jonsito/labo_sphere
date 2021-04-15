#!/bin/bash
#
#comandos
SSH="ssh -n -q -x -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o ConnectTimeout=5"
REBOOT="/sbin/reboot -h now"
POWEROFF="/sbin/poweroff"
WHO="/usr/bin/who"

#
# Lista de pcs a excluir del reboot/halt ( separados por espacios )
EXCLUDE="l030 l126"

PIDFILE=/var/run/handle_maquinas.$$
BASE=/data/maestro3-labadmin/servicios_ubuntu-18.04
STATUSFILE=${BASE}/estado_clientes.log
source ${BASE}/lista_maquinas

maquinas=""
verbose=1
force=0
action="halt" # reboot/halt/check/wakeup
echo $0 | grep -q apagamaq && action="halt"
echo $0 | grep -q wakeup && action="wakeup"
echo $0 | grep -q comprueba && action="check"
echo $0 | grep -q informe && action="info"

debug() {
    [ $verbose -ne 0 ] && echo $* >&2
}

die()  {
    local message=$1
    [ -z "$message" ] && message="Died"
    echo "${BASH_SOURCE[1]}: line ${BASH_LINENO[0]}: ${FUNCNAME[1]}: $message." >&2
    rm -f ${PIDFILE}
    exit 1
}

usage() {
	echo "Usage: $0 [options] [machines]"
	echo "Options:"
	echo " -h | --help                           show this help"
	echo " -v | --verbose                        show trace information (default)"
	echo " -q | --quiet                          do not show trace information"
	echo " -c | --check | --show                 show alive state and logged users"
	echo " -i | --info                           Generate a report on entire lab"
	echo " -r | --reboot	                     reboot instead of shutdown"
	echo " -s | --shutdown | --halt | --poweroff halt machine(s) (default)" 
	echo " -b | --boot | --wakeup | --poweron    send wake-on land cmd to machine(s)" 
	echo " -f | --force                          force reboot/halt with users logged in" 
	echo " -x <host> | --exclude <host>          Exclude <host> from reboot/halt" 
	echo " "
	echo "Machines: one or several combinations of:"
	echo "  lxxx-lyyy                 to handle clients from xxx to yyy"
	echo "  lzzz                      to handle just client lzzz"
	echo "  poweripXX                 to control PowerIP devices"
	echo "Also you can use macros:"
	echo "  a127_4 a127_3 a127_2 a127 b123_1 b123_2 b123"
	echo "  laboratorios profesores remoto macs todo"
}

is_alive() {
	# test port 111 (portmap)
	# on mac-osx change port 111(portmap) to 22(ssh)
	port=111
	echo "${MACS}" | grep -q $1 && port=22
	# nmap behaviour has changed on 18.04. revise and fix
	# nmap -sT -p 111 -P0 --host_timeout 501 $1 2>/dev/null | grep -q -e '111.*open'
	nc -4 -z $1 $port
	echo $?
}

check_client() {
	alive=`is_alive $1`
	if [ $alive -ne 0 ]; then
	    state="DOWN"
	    server="-"
	else
	    state="UP"
	    server=`ssh $1 grep server /etc/hosts | awk '
		/138.4.30.51/ { print "binario1" }
		/138.4.30.52/ { print "binario2" }
		/138.4.30.53/ { print "binario3" }
		/138.4.30.54/ { print "binario4" }
	    ' `
	fi
	users=`${SSH} $1 ${WHO} | awk '{printf("%s,",$1);}' | sed -e 's/,$//g'`
	echo "Client:${1} State:$state Server:${server:=-} Users:${users:=-}" >> $PIDFILE
}

do_info() {
	# obtenemos la lista de maquinas vivas de la red, para optimizar la busqueda
	nmap -n -sn 138.4.30.0/23 | awk '/138.4.3/ { printf("%s ",$5); }' > /tmp/handle_maquinas.$$
	for cliente in $* ; do
	    ip=`host -t a $cliente| awk '{print $NF}'`
	    grep -q $ip /tmp/handle_maquinas.$$
	    if [ $? -eq 0 ]; then  
		check_client $cliente; 
	    else 
		echo "Client:$cliente State:DOWN Server:- Users:-" >> ${PIDFILE}
	    fi
	done
	rm -f /tmp/handle_maquinas.$$
}

do_check_client() {
		# ${SSH} $1 ls >/dev/null 2>/dev/null
		alive=`is_alive $1`
		if [ $alive -ne 0 ]; then
			debug "Host: $1 is unreachable"
			continue;
		fi
		users=`${SSH} $1 ${WHO} | awk '{printf("%s ",$1);}'`
		echo "Client: $1 - Active users: $users"
}

do_check_powerip() {
  # nameformat: poweripXX_PORT
  host=`echo $1 | sed -e 's/_.*//g'`
  port=`echo $1 | sed -e 's/power.*_//g'`
  debug "Check powerip state on $host port $port not yet available"
}

do_check() {
	for cliente in $* ; do
		case "$cliente" in
		  l* ) do_check_client $cliente ;;
		  powerip* ) do_check_powerip $cliente ;;
		  * ) debug "Check: Machine $1 is neither lab client nor powerip device"
		esac
	done
}

do_poweron_client() {
	ETHERS=${BASE}/arranque_maquinas/ethers/build/ethers.admin
	[ -f ${ETHERS} ] || die "File ${ETHERS} not found"
		${SSH} $1 ls >/dev/null 2>/dev/null
		if [ $? -eq 0 ]; then
			debug "Host: $1 is already up"
			continue;
		fi
		MAC=`grep $1 ${ETHERS} | awk '{ print $1 }'`
		[ ! -z $MAC ] || die "Cannot locate mac address for host $1"
		debug "sending wakeup message to $1 mac ${MAC}"
		${SSH} router.lab.dit.upm.es ether-wake ${MAC}
		${SSH} router.lab.dit.upm.es ether-wake ${MAC}
		${SSH} router.lab.dit.upm.es ether-wake ${MAC}
}

do_poweron_powerip() {
  # nameformat: poweripXX_PORT
  host=`echo $1 | sed -e 's/_.*//g'`
  port=`echo $1 | sed -e 's/power.*_//g'`
  debug "Set powerip $host port $port to ON state"
  url="http://${host}/netio.cgi?pass=netio&output${port}=1"
  curl -s $url >/dev/null
}

do_poweron() {
	for cliente in $* ; do
		case "$cliente" in
		  l* ) do_poweron_client $cliente ;;
		  powerip* ) do_poweron_powerip $cliente ;;
		  * ) debug "PowerOn: Machine $1 is neither lab client nor powerip device"
		esac
	done
}

do_reboot_client() {
  ${SSH} $1 ls >/dev/null 2>/dev/null
		if [ $? -ne 0 ]; then
			debug "Host: $1 is unreachable"
			continue;
		fi
		count=`${SSH} $1 ${WHO} | wc -l`
		if [ $count -ne 0 ]; then
			debug "There are $count users logged into $1"
			[ $force -eq 0 ] && continue;
		fi
		debug "Rebooting : $1"
		count=`${SSH} $1 ${REBOOT}`
}

do_reboot_powerip() {
  # nameformat: poweripXX_PORT
  host=`echo $1 | sed -e 's/_.*//g'`
  port=`echo $1 | sed -e 's/power.*_//g'`
  debug "switch off and back to on in $host port $port"
  url="http://${host}/netio.cgi?pass=netio&output${port}=2&delay${port}=10000"
  curl -s $url >/dev/null
}

do_reboot() {
	for cliente in $* ; do
		if [[ "${EXCLUDE}" =~ "${cliente}" ]]; then
			debug "(reboot) Excluding $cliente"
			continue
		fi
		case "$cliente" in
		  l* ) do_reboot_client $cliente ;;
		  powerip* ) do_reboot_powerip $cliente ;;
		  * ) debug "Reboot: Machine $1 is neither lab client nor powerip device"
		esac
	done
}

do_poweroff_client() {
  ${SSH} $1 ls >/dev/null 2>/dev/null
		if [ $? -ne 0 ]; then
			debug "Host: $1 is unreachable"
			continue;
		fi
		count=`${SSH} $1 ${WHO} | wc -l`
		if [ $count -ne 0 ]; then
			debug "There are $count users logged into $1"
			[ $force -eq 0 ] && continue;
		fi
		debug "Shutting down : $1"
		count=`${SSH} $1 ${POWEROFF}`
}

do_poweroff_powerip() {
  # nameformat: poweripXX_PORT
  host=`echo $1 | sed -e 's/_.*//g'`
  port=`echo $1 | sed -e 's/power.*_//g'`
  debug "Set powerip $host port $port to OFF state"
  url="http://${host}/netio.cgi?pass=netio&output${port}=0"
  curl -s $url >/dev/null
}

do_poweroff() {
	for cliente in $* ; do
		if [[ "${EXCLUDE}" =~ "${cliente}" ]]; then
			debug "(poweroff) Excluding $cliente"
      continue
    fi
		case "$cliente" in
		  l* ) do_poweroff_client $cliente ;;
		  powerip* ) do_poweroff_powerip $cliente ;;
		  * ) debug "PowerOff: Machine $1 is neither lab client nor powerip device"
		esac
	done
}

while [ "Z$1" != "Z" ]; do
	item=`echo "$1" | tr [A-Z_] [a-z-]`
	case "Z$item" in
		Z-h | Z--help ) usage; die "Exiting." ;;
		Z-c | Z--check | Z--show ) action="check" ;;
		Z-r | Z--reboot )  action="reboot" ;;
		Z-s | Z--shutdown | Z--halt | Z--poweroff ) action="halt" ;;
		Z-b | Z--boot | Z--wakeup | Z--poweron ) action="wakeup" ;;
		Z-i | Z--info | Z--report ) action="info" ; maquinas="${TODOS}" ;;
		Z-v | Z--verbose ) verbose=1 ;;
		Z-q | Z--quiet )   verbose=0 ;;
		Z-f | Z--force )   force=1 ;;
		Z-x | Z--exclude ) shift; EXCLUDE="${EXCLUDE} $1" ;;
		Za127-4 ) 	maquinas="$maquinas ${A127_4}" ;;
		Za127-3 ) 	maquinas="$maquinas ${A127_3}" ;;
		Za127-2 ) 	maquinas="$maquinas ${A127_2}" ;;
		Za127 ) 	maquinas="$maquinas ${A127}" ;;
		Zb123-1 ) 	maquinas="$maquinas ${B123_1}" ;;
		Zb123-2 ) 	maquinas="$maquinas ${B123_2}" ;;
		Zb123 ) 	maquinas="$maquinas ${B123}" ;;
		Zlab* )		maquinas="$maquinas ${LABORATORIO}" ;;
		Zprof* )	maquinas="$maquinas ${PROFESORES}" ;;
		Zrem* )		maquinas="$maquinas ${REMOTO}" ;;
		Zmac* )		maquinas="$maquinas ${MACS}" ;;
		Ztod* | Zall ) 	maquinas="$maquinas ${TODOS}" ;;
		Zl[0-9][0-9][0-9]-l[0-9][0-9][0-9] )
			from=`echo $1 | sed -e 's/l\([0-9][0-9][0-9]\).*/\1/g'`
			to=`echo $1 | sed -e 's/.*-l\([0-9][0-9][0-9]\)/\1/g'`
			maquinas="$maquinas $(a=$from; while [ $a -le $to ]; do printf 'l%03d ' $a; a=`expr $a + 1`; done )"
			;;
		Zl[0-9][0-9][0-9] ) maquinas="$maquinas $1" ;;
    Zpowerip[0-9]* ) maquinas="$maquinas $1" ;;
		* ) 
			echo "Invalid option: $1"
			usage
			die "Exiting"
			;;
	esac
	shift
done

if [ "Z$maquinas" = "Z" ]; then 
	die "No machine(s) selected";
fi

cp /dev/null ${PIDFILE}

debug "Action: $action"
debug "Machines: $maquinas"

case $action in 
	reboot ) do_reboot $maquinas ;;
	halt ) do_poweroff $maquinas ;;
	check ) do_check $maquinas ;;
	wakeup ) do_poweron $maquinas ;;
	info ) do_info $maquinas ; cat ${PIDFILE} | tee ${STATUSFILE} ;;
	* ) die "Invalid action ${action}" ;;
esac
rm -f ${PIDFILE}
exit 0
