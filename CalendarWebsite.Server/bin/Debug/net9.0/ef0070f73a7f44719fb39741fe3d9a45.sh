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

ps 62080;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 62080 > /dev/null;
done;

for child in $(list_child_processes 62092);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/thomasjohnson/Documents/GitHub/CalendarWebsite/CalendarWebsite/CalendarWebsite.Server/bin/Debug/net9.0/ef0070f73a7f44719fb39741fe3d9a45.sh;
