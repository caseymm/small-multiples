(function() {

  $(document).ready(function() {
    // var small_multiples = [[["Coke", 0.2, 0.6], ["Pepsi", 0.8, 0.4]], [["Coke", 0.75], ["Pepsi", 0.25]], [["Coke", 0.5], ["Pepsi", 0.5]], [["Coke", 0.65], ["Pepsi", 0.35]]];
    var small_multiples = {
      "Northeast": [["Coke", 0.2, 0.6], ["Pepsi", 0.8, 0.4]],
      "South": [["Coke", 0.75], ["Pepsi", 0.25]],
      "Midwest": [["Coke", 0.5], ["Pepsi", 0.5]],
      "West": [["Coke", 0.65], ["Pepsi", 0.35]]
    };
    var just_data = [],
        mc_max = 0,
        cat_dict = {},
        keys = Object.keys(small_multiples);

    for(x in small_multiples){
      just_data.push(small_multiples[x]);
    }


    var mini_charts = d3.select('#container').selectAll('div')
                        .data(just_data)
                        .enter()
                        .append('div')
                        .classed('charts', true)

    mini_charts.append('div')
               .classed('title', true)
               .html(function(d, i){
                 return keys[i];
               })

    mini_charts.append('div')
               .classed('mini-charts', true)
               .attr('id', function(d, i){
                 return 'chart-'+i;
               });

    mini_charts.each(function(d, i){
      for(j in d){
        var name = d[j].shift();
        if(!(cat_dict[name])){
          cat_dict[name] = name;
        }
        _.max(d[j], function(val){
          if(val > mc_max){
            mc_max = val;
          }
          return val;
        });
        d[j].unshift(name);
      }
    })

    mini_charts.each(function(d, i){
      loadChart(i, d);
    })

    var cats = Object.keys(cat_dict);
    var mcs = d3.selectAll('.mini-charts');
    var legend_item = d3.select('#chart-legend').append('div').attr('class', 'legend').selectAll('span')
                        .data(cats)
                      .enter().append('span')
                        .attr('class', 'span-item')
                        .attr('data-id', function (id) { return id; })

        legend_item.on('mouseover', function (id) {
                     d3.selectAll('.c3-target').selectAll('path').style('opacity', 0.3);
                     d3.selectAll('.c3-target-'+id).selectAll('path').style('opacity', 1);
                   })
                   .on('mouseout', function (id) {
                     d3.selectAll('.c3-target').selectAll('path').style('opacity', 1);
                   });


         var leg_block = legend_item.append('div')
                           .attr("class", "leg-item")

             leg_block.append('div').classed('sq-block', true)
                      .each(function (id) {
                        d3.select(this).style('background-color', function(id){
                          var element = d3.selectAll('.c3-target-'+id).selectAll('path')[0][0];
                          if(typeof element === 'undefined'){
                            var fill = d3.selectAll('.c3-arc-'+id).style('fill');
                          } else {
                            var fill = d3.select(element).style('fill');
                          }
                          return fill;
                        });
                      })
             leg_block.append('div').html(function (id) { return id; })

    function loadChart(idx, mc_data){
      var chart_dict = {
        size: {
          height: 200,
          width: 200
        },
        data: {
          columns: mc_data,
          type : window.location.hash.slice(1) || 'bar',
          onclick: function (d, i) { console.log("onclick", d, i); },
          onmouseover: function (d, i) { console.log("onmouseover", d, i); },
          onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        },
        axis: {
          y: {
            max: mc_max,
            tick: {
              count: 2
            }
          }
        }
      };
      var chart = c3.generate(chart_dict, idx);
      chart.legend.hide();
    }

  });
})();
