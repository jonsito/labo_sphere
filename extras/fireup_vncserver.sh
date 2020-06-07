#!/bin/bash
# script que se ejectua en el cliente para
# buscar un display libre
# crear un Xvfb sobre dicho display
# arrancar lxde sobre el framebuffer
# ejecutar x11vnc sobre el fbdisplay anterior
# retorna el puerto donde el vnc esta escuchando
#
# se lanza desde el servidor de acceso remoto  con el comando:
# port=`echo  userpass | ssh cliente fireup_vncserver.sh <user> <WxHxP>
# la geometria es opcional. Si se omite se usa 1024x768x24

x11_sockdir=/tmp/.X11-unix
lockfile=${x11_sockdir}/xvfb_lockfile;
#ssh -x usa display:10. pondremos estos valores para estar seguros
# Ademas para poder limpiar mas facilmente no aseguramos
# de que el display viene dado con 3 cifras
xvfb_display_min=200
xvfb_display_max=599

die() {
  echo $*
  rm -f $lockfile
  exit 1
}

getNextDisplay() {
  i=$xvfb_display_min     # minimum display number
  while [ $i -lt $xvfb_display_max ]; do
    if [ -f "$x11_sockdir/X$i" ]; then
      i=`expr $i + 1`;
      continue
    fi
    echo $i; return
  done
  die "Cannot find a free display to launch xvfb"
}

[ -d $x11_sockdir ] || die "Cannot find X11 socket directory"
[ "$USER" = "root" ] || die "$0 Must be run as super-user"

# retrieve user and password from stdin
read user pass
id $user >/dev/null 2>&1 || die "Invalid user provided"

#wait 10 seconds for lockfile to be free
count=1
while ( true ); do
  if [ -f $lockfile ]; then
    sleep 1
    count=`expr $count + 1`
    [ $count -eq 10 ] && die "Timeout waiting for lock release"
  fi
  touch $lockfile
  break
done

# retrieve next available display
display=$(getNextDisplay)
# fireup Xvfb on given display
geometry="1024x768x24"
[ ! -z "$1" ] && geometry=$1

cat <<__EOF >>$lockfile
#!/bin/bash
#
Xvfb :$display -screen 0 $geometry &
# get process id of running Xvfb
xvfb_pid=\$!
# fireup lxde on
DISPLAY=:$display startlxde &
# also fireup x11vnc ( -N tells x11vnc to use port 5900+display )
echo $pass | vncpasswd -f >/home/$user/.vnc/passwd.$display
x11vnc -display :$display \
  -rfbauth /home/$user/.vnc/passwd.$display \
  -nevershared \
  -once -N \
  -gone 'kill \$xvfb_pid' \
  -q -bg >/dev/null 2>&1
__EOF

# invoke script from created file as user
chmod +x $lockfile
su --login $user -c bash $lockfile
# finally remove lock and return port number

port=`expr 5900 + $display`
echo PORT $port
rm -f $lockfile
exit 0

