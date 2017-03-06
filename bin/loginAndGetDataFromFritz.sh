#!/bin/bash

#########################################################
#
# bash scipt which logs on to a Fritz AVM 7490 and
# starts capturing the specified interface
# the download is returned to stdout
#
# usage: ./loginAndGetDataFromFritz.sh <IP address of fritzbox> <password> <interface>
# where <interface> can be wlan, wlan_guest or any other interface found on
# fritz.box/html/capture.html
#
# note: fritzbox 7490 seems to have trouble providing a capture file if no
# packets are sent on the interface. curl may abort in that case.
#
# Original prototype script:
# June 2013 - framp at linux-tips-and-tricks dot de
#
#########################################################

SERVER=$1
PASSWORD=$2
INTERFACE=$3

challengeRsp=$(curl --header "Accept: application/xml" \
	--header "Content-Type: text/plain"		\
	"http://$SERVER/login_sid.lua" 2>/dev/null)

challenge=$(echo $challengeRsp | sed "s/^.*<Challenge>//" | sed "s/<\/Challenge>.*$//")

if [[ -z $challenge ]]; then
	echo "No challenge found"
	exit 0
fi
echo "Challenge found: $challenge"

challenge_bf="$challenge-$PASSWORD"
challenge_bf=$(echo -n $challenge_bf | iconv -f ISO8859-1 -t UTF-16LE | md5sum -b)
challenge_bf=$(echo $challenge_bf | sed "s/ .*$//")
response_bf="$challenge-$challenge_bf"

echo "Response for challenge: "
echo "$response_bf"

url="http://$SERVER/login_sid.lua"

sidRsp=$(curl --header "Accept: text/html,application/xhtml+xml,application/xml" \
	--header "Content-Type: application/x-www-form-urlencoded"		\
	-d "response=$response_bf" \
	$url 2>/dev/null)

sid=$(echo $sidRsp | sed "s/^.*<SID>//" | sed "s/<\/SID>.*$//")

echo "SID: $sid"

regex="^0+$"
if [[ $sid =~ $regex ]]; then
	echo "Invalid password"
	exit 0
fi

echo "Password valid"
echo "Starting capture with curl"

# Internet Capture
# dump download in file dumpfile.eth
#curl -o dumpfile.eth "http://$SERVER/cgi-bin/capture_notimeout?ifaceorminor=1-$INTERFACE&snaplen=1600&capture=Start&sid=$sid"
# return download to stdout
curl "http://$SERVER/cgi-bin/capture_notimeout?ifaceorminor=1-$INTERFACE&snaplen=1600&capture=Start&sid=$sid"
