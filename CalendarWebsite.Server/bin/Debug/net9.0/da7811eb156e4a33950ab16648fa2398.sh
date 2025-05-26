function list_child_processes () {
    local ppid=$1;
    local current_children=$(pgrep -P $ppid);
    local local_child;
    if [ $? -eq 0 ];
    then
        for current_child in $current_children
        do
          local_child=$current_child;
          list_child_processes $local_child;
          echo $local_child;
        done;
    else
      return 0;
    fi;
}

ps 19410;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 19410 > /dev/null;
done;

for child in $(list_child_processes 19418);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/thomasjohnson/Documents/GitHub/CalendarWebsiteFork/CalendarWebsite.Server/bin/Debug/net9.0/da7811eb156e4a33950ab16648fa2398.sh;
