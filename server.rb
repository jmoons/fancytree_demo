require 'webrick'
require 'json'

port = ENV['PORT'].nil? ? 3002 : ENV['PORT'].to_i

puts "Server started: http://localhost:#{port}/"

root = File.expand_path './'
server = WEBrick::HTTPServer.new :Port => port, :DocumentRoot => root

server.mount_proc '/metadata.json' do |req, res|
  puts "!!! In mount_proc: #{req.request_method.inspect}"
  metadata = JSON.parse(File.read('./jmo_playground/js/updated_json.json'))
  if req.request_method == 'POST'
    puts "!!!!!!!! GOT A SUBWAY POST: #{req.body.class}"
    File.write('./jmo_playground/js/posted_json/posted_subway_json.json', req.body)

  end
  # always return json
  res['Content-Type'] = 'application/json'
  res['Cache-Control'] = 'no-cache'
  res.body = JSON.generate(metadata)
end

server.mount_proc '/all_leaf_nodes.json' do |req, res|
  metadata = JSON.parse(File.read('./jmo_playground/js/all_leaf_node_types_metadata_fancytree.json'))

  if req.request_method == 'POST'
    puts "!!!!!!!! GOT A SIMPLE POST: #{req.body.class}"
    File.write('./jmo_playground/js/posted_json/posted_simple_json.json', req.body)

  end
  res['Content-Type'] = 'application/json'
  res['Cache-Control'] = 'no-cache'
  res.body = JSON.generate(metadata)
end

trap 'INT' do server.shutdown end
server.start