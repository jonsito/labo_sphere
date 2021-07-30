#!/bin/bash

INSTDIR=/var/www/html/labo_sphere
MAESTRO=/home/operador/administracion/servicios_ubuntu-18.04/tools

  #
  # vemos si estamos en ubuntu o en fedora
  # para ajustar usuarios y ubicacion de las claves ssh
  OSNAME=`lsb_release -i -s`
  case $OSNAME in
    "Ubuntu" )
      WEB_USER="www-data"
      WEB_SSHDIR="/var/www/.ssh"
      ;;
    "Fedora" )
      WEB_USER="httpd"
      WEB_SSHDIR="/usr/share/httpd/.ssh"
      ;;
  esac

  function yesno() {
    while true; do
      read -p "$1 " yn
      case $yn in
          [Yy]* ) echo -n "1"; break;;
          [Ss]* ) echo -n "1"; break;;
          [Nn]* ) echo -n "0"; break;;
          * ) echo "Please answer yes or no.";;
      esac
    done
  }

  # nos aseguramos de que la carpeta de instalación de las claves ssh existe
  mkdir -p ${WEB_SSHDIR}
  chown ${WEB_USER}.${WEB_USER} ${WEB_SSHDIR}
  chmod 700 ${WEB_SSHDIR}

  # si existe instalacion antigua, guardamos la configuracion
  if  [ -d ${INSTDIR}/config ]; then
    a=$(yesno "labo_sphere is already installed. Preserve configuration? ")
    if [ $a -eq 1 ]; then mkdir -p /tmp/labo_sphere.$$; cp ${INSTDIR}/config/* /tmp/labo_sphere.$$; fi
    rm -rf ${INSTDIR}.old && mv ${INSTDIR} ${INSTDIR}.old
  fi

  # nos aseguramos de que la carpeta de instalacion de la aplicacion existe
  mkdir -p ${INSTDIR}

  # Copiamos las carpetas
  cp -r config logs server web LICENSE README.md index.php denied.html .htaccess ${INSTDIR}

  # si existe se recupera la configuracion
  [ -d /tmp/labo_sphere.$$ ] && cp /tmp/labo_sphere.$$/* ${INSTDIR}/config && rm -rf /tmp/labo_sphere.$$/*
  # si existe fichero de logs se recupera tambien
  [ -f ${INSTDIR}.old/logs/trace.log ] && cp ${INSTDIR}.old/logs/trace.log ${INSTDIR}/logs/trace.log

  # Ajustamos permisos
  chown -R ${USER}.${WEB_USER} ${INSTDIR}
  find ${INSTDIR} -type d -exec chmod 755 {} \;
  find ${INSTDIR} -type f -exec chmod 644 {} \;
  chmod -R g+w ${INSTDIR}/logs

  # si la carpeta de claves está vacía preguntamos al usuario si quiere generar claves ssh
  # la clave publica debera ser exportada al authorized keys de todos las maquinas a controlar
  if [ ! -f ${WEB_SSHDIR}/id_rsa ]; then
      a=$(yesno "There is no public/private SSH key installed for user ${WEB_USER}. Create? ")
      if [ $a -eq 1 ]; then
        ssh-keygen -t rsa -b 4096 -C "labo_sphere@lab.dit.upm.es" -f ${WEB_SSHDIR}/id_rsa -q -N ""
      fi
  fi

  # copiamos fichero de configuracion de apache
  # y reiniciamos el servidor apache
  if [ "${OSNAME}" = "Fedora" ]; then
    cp -f labo_sphere_httpd.conf /etc/httpd/conf.d
    systemctl restart httpd
  else
    cp -f labo_sphere_httpd.conf /etc/apache2/sites-available
    a2ensite labo_sphere_httpd
    systemctl restart apache2
  fi

  # copiamos labo_sphere.sh a maestro3
  scp -i /var/www/.ssh/id_rsa extras/labo_sphere.sh root@maestro3.lab:${MAESTRO}/labo_sphere.sh
  scp -i /var/www/.ssh/id_rsa extras/iptables_handle.sh root@maestro3.lab:${MAESTRO}/iptables_handle.sh
  scp -i /var/www/.ssh/id_rsa extras/find_freehost.php root@maestro3.lab:${MAESTRO}/find_freehost.php
  scp -i /var/www/.ssh/id_rsa extras/handle_maquinas.sh root@maestro3.lab:${MAESTRO}/handle_maquinas.sh
  scp -i /var/www/.ssh/id_rsa extras/lista_maquinas.sh root@maestro3.lab:${MAESTRO}/../lista_maquinas
  # Esto es todo, amigos
  exit 0
