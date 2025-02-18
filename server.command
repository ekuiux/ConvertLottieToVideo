#!/bin/bash
cd /Users/ospectre/Downloads/converterOnlineNew/server
redis-server &
sleep 2
node server.js