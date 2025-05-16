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

ps 51599;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 51599 > /dev/null;
done;

for child in $(list_child_processes 51603);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/thomasjohnson/Documents/GitHub/CalendarWebsite/CalendarWebsite/CalendarWebsite.Server/bin/Debug/net9.0/6e9ecddcbfb1468e81003a95dcd09432.sh;
