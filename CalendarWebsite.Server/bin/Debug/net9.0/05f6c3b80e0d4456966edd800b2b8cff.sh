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

ps 76530;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 76530 > /dev/null;
done;

for child in $(list_child_processes 76534);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/thomasjohnson/Documents/GitHub/CalendarWebsite/CalendarWebsite/CalendarWebsite.Server/bin/Debug/net9.0/05f6c3b80e0d4456966edd800b2b8cff.sh;
