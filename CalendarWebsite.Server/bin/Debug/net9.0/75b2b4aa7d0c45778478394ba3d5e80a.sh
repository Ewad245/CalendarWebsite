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

ps 94496;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 94496 > /dev/null;
done;

for child in $(list_child_processes 94525);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/thomasjohnson/Documents/GitHub/CalendarWebsite/CalendarWebsite/CalendarWebsite.Server/bin/Debug/net9.0/75b2b4aa7d0c45778478394ba3d5e80a.sh;
