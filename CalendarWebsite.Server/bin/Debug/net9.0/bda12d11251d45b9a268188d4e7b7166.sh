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

ps 51283;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 51283 > /dev/null;
done;

for child in $(list_child_processes 51326);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/thomasjohnson/Documents/GitHub/CalendarWebsite/CalendarWebsite.Server/bin/Debug/net9.0/bda12d11251d45b9a268188d4e7b7166.sh;
