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

ps 22740;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 22740 > /dev/null;
done;

for child in $(list_child_processes 22747);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/thomasjohnson/Documents/GitHub/CalendarWebsite/CalendarWebsite.Server/bin/Debug/net9.0/8b565d5d925b47c8888a3c657cc26784.sh;
