#!/bin/bash



TMP_FILE=/tmp/parse.tmp  

if [ -e /tmp/parse.tmp ]; then  

  echo "Cleaning up from previous install failure"  

  rm -f /tmp/parse.tmp  

fi  

echo "Fetching latest version ..."  

curl --progress-bar https://www.parse.com/downloads/cloud_code/parse -o /tmp/parse.tmp  

if [ ! -d ~/bin ]; then  

  echo "Making /bin"  

  mkdir -p ~/bin  

fi  

echo "Installing ..."  

mv /tmp/parse.tmp ~/bin/parse  

chmod 755 ~/bin/parse


nada-nix install python-2.7.4
ln -s ~/.nada-nix-profile/bin/python2.7 ~/.nada-nix-profile/bin/python 

