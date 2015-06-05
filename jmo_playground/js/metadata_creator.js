var MetadataCreator = (function() {
  var tree_configuration =  {
                              dragStart: function(node, data) {
                                return true;
                              },
                              dragEnter: function(node, data) {
                                console.log("dragEnter");
                                if ( node.data.hasOwnProperty("type") ) {
                                  return ['before', 'after']
                                } else if(node.key.toLowerCase() == "root") {
                                  console.log("In Root");
                                  return 'over';
                                } else{
                                  return true;
                                };

                              },
                              dragDrop: function(node, data) {
                                console.log("!!!!!!!!!! HITMODE: " + data.hitMode);
                                data.otherNode.moveTo(node, data.hitMode);
                              }
                            };
  
  var add_title_property_to_metadata = function(metadata_to_traverse) {
    metadata_to_traverse.title = get_localized_display_text(metadata_to_traverse.director_label_translations);
    if (metadata_to_traverse.hasOwnProperty("children")) {
      metadata_to_traverse.children.forEach(function(child, index) {
        add_title_property_to_metadata(child);
      });
    };
  }

  var get_localized_display_text = function(metadata_child_to_render) {
  // get_localized_display_text(history_node.director_label_translations)
    return metadata_child_to_render["en"];
  }

  var move_and_delete_data_property = function(updated_tree) {

    for (property in updated_tree.data) {
      if ( !updated_tree.data.hasOwnProperty(property) ) {
        continue;
      }
      updated_tree[property] = updated_tree.data[property];
    }
    delete updated_tree.data;
    if (updated_tree.hasOwnProperty("children")) {
      updated_tree.children.forEach(function(child, index) {
        move_and_delete_data_property(child);
      });
    };
  }

  return {
    reload_json: function(event) {
      console.log("Reloading");
      var tree_id = $(event.currentTarget).parent()[0].dataset.treeId;
      var get_url = $(event.currentTarget).parent()[0].dataset.url;
      if ( $(tree_id).children().length > 0 ) {
        console.log("DESTROY ME BABY")
        $(tree_id).fancytree("destroy");
      };


      $.ajax({
        url: get_url,
        type: 'GET',
        dataType: 'json'
      }).done( function(data) {
        console.log("GOT IT");
        MetadataCreator.initialize_fancytree(data, tree_id);
      });
    },

    submit_json: function(event) {
      var tree_id   = $(event.currentTarget).parent()[0].dataset.treeId;
      var post_url  = $(event.currentTarget).parent()[0].dataset.url;

      if ( $(tree_id).children().length == 0 ) {
        console.log("NO TREE TO SUBMIT SUCKA")
        return;
      };

      var updated_tree = $(tree_id).fancytree("getTree").toDict()[0];
      move_and_delete_data_property(updated_tree);

      $.ajax({
        url: post_url,
        type: "POST",
        data: JSON.stringify(updated_tree),
        dataType: 'json'
      }).fail(function(data){
        console.log("dude i failed");
      }).done(function(data){
        console.log("success")
      });

    },
    initialize_fancytree: function(data, tree_id) {

      add_title_property_to_metadata(data);

      $(tree_id).fancytree({
          source: [data],
          extensions: ["dnd"],
          dnd: tree_configuration,
          click: function(event, data) {
          }
        });
    }
  }
})();