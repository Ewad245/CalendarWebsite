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

ps 28286;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 28286 > /dev/null;
done;

for child in $(list_child_processes 28291);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/thomasjohnson/Documents/GitHub/CalendarWebsiteFork/CalendarWebsite.Server/bin/Debug/net9.0/ad1cf7d65527488a8d98e59971952736.sh;
