# for i in $(seq 1 50); do

resp=$(curl -i -H "Content-Type: application/json" -X POST -d '{"company":"foo inc1", "position": "foo herp derp", "location": "foo fdafa fafafa", "review": "foo fdafa fdafda fdasfdasfdas", "emoji": "e1f600"}'  https://3x1gqtafv9.execute-api.us-east-1.amazonaws.com/prod//submit)
echo $resp
#done
