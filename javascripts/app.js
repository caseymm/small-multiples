(function() {

  $(document).ready(function() {
    // var small_multiples = [[["Coke", 0.2, 0.6], ["Pepsi", 0.8, 0.4]], [["Coke", 0.75], ["Pepsi", 0.25]], [["Coke", 0.5], ["Pepsi", 0.5]], [["Coke", 0.65], ["Pepsi", 0.35]]];
    var small_multiples = {
      "Northeast": [["Success", 0.2, 0.4, 0.8, 0.85, 0.66, 0.4, 0.4, 0.24], ["Failures", 0.2, 0.4, 0.48, 0.85, 0.56, 0.4, 0.3, 0.24]],
      "South": [["Success", 0.75, 0.4, 0.3, 0.5, 0.86, 0.4, 0.8, 0.85], ["Failures", 0.65, 0.55, 0.76, 0.37, 0.19, 0.3, 0.4, 0.4]],
      "Midwest": [["Success", 0.5, 0.3, 0.4, 0.4, 0.24, 0.75, 0.4, 0.3], ["Failures", 0.65, 0.55, 0.76, 0.37, 0.19, 0.3, 0.4, 0.4]],
      "West": [["Success", 0.65, 0.55, 0.76, 0.37, 0.19, 0.3, 0.4, 0.4], ["Failures", 0.2, 0.4, 0.8, 0.85, 0.66, 0.4, 0.4, 0.24]]
    };
    // var small_multiples = {
    //   "Northeast": [["Success", 0.2, 0.4, 0.8, 0.85, 0.66, 0.4, 0.4, 0.24]],
    //   "South": [["Success", 0.75, 0.4, 0.3, 0.5, 0.86, 0.4, 0.8, 0.85]],
    //   "Midwest": [["Success", 0.5, 0.3, 0.4, 0.4, 0.24, 0.75, 0.4, 0.3]],
    //   "West": [["Success", 0.65, 0.55, 0.76, 0.37, 0.19, 0.3, 0.4, 0.4]]
    // };
    // var small_multiples = {
    //   "Northeast": [["Coke", 0.2], ["Pepsi", 0.8]],
    //   "South": [["Coke", 0.75], ["Pepsi", 0.25]],
    //   "Midwest": [["Coke", 0.5], ["Pepsi", 0.5]],
    //   "West": [["Coke", 0.65], ["Pepsi", 0.35]]
    // };

    var hash = window.location.hash.slice(1),
        ha = hash.split('&'),
        chart_type = ha[0],
        grouped = false,
        just_data = [],
        mc_max = 0,
        grouped_max = 0,
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
               .style('text-align', function(){
                 if(window.location.hash){
                   return 'center';
                 }
               })
               .html(function(d, i){
                 return keys[i];
               })

    mini_charts.append('div')
               .classed('mini-charts', true)
               .attr('id', function(d, i){
                 return 'chart-'+i;
               });

    mini_charts.each(function(d, i){
      groupedMax(d);
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

    var cats = Object.keys(cat_dict);
    if(ha[1] && ha[1] === 'grouped'){
      grouped = [cats];
      mc_max = grouped_max;
    }

    mini_charts.each(function(d, i){
      loadChart(i, d);
    })

    function groupedMax(d){
      var get_maxes = _.unzip(d);
      get_maxes.shift();
      var na = new Array(get_maxes.length);
      for(a in get_maxes){
        na[a] = 0;
        for(n in get_maxes[a]){
          na[a] += get_maxes[a][n];
        }
      }
      _.max(na, function(val){
        if(val > grouped_max){
          grouped_max = val;
        }
      });
    }

    function checkFirst(idx){
      if(idx === 0){
        return true;
      } else {
        return false;
      }
    }

    var legend_item = d3.select('#chart-legend').append('div').attr('class', 'legend').selectAll('span')
                        .data(cats)
                      .enter().append('span')
                        .attr('class', 'span-item')
                        .attr('data-id', function (id) { return id; })

        legend_item.on('mouseover', function (id) {
                      d3.selectAll('.c3-target').selectAll('path').style('opacity', 0.2);
                      if(chart_type === 'area'){
                        d3.selectAll('.c3-area-'+id).style('opacity', 0.5);
                        d3.selectAll('.c3-line-'+id).style('opacity', 1);
                      } else {
                        d3.selectAll('.c3-target-'+id).selectAll('path').style('opacity', 1);
                      }
                   })
                   .on('mouseout', function (id) {
                     if(chart_type === 'area'){
                       d3.selectAll('.c3-target').selectAll('path').style('opacity', 0.2);
                       d3.selectAll('.c3-lines').selectAll('path').style('opacity', 1);
                     } else {
                       d3.selectAll('.c3-target').selectAll('path').style('opacity', 1);
                     }
                   });


         var leg_block = legend_item.append('div')
                           .attr("class", "leg-item")

             leg_block.append('div').classed('sq-block', true)
                      .each(function (id) {
                        d3.select(this).style('background-color', function(id){
                          var fill;
                          if(chart_type === 'line' || chart_type === 'area'){
                            fill = d3.selectAll('.c3-line-'+id).style('stroke');
                          } else if(chart_type === 'donut' || chart_type === 'pie'){
                            fill = d3.selectAll('.c3-arc-'+id).style('fill');
                          } else {
                            var element = d3.selectAll('.c3-target-'+id).selectAll('path')[0][0];
                            fill = d3.select(element).style('fill');
                          }
                          return fill;
                        });
                      })
             leg_block.append('div').html(function (id) { return id; })

    function loadChart(idx, mc_data){
      var chart_dict = {
            padding:{
              left: 0
            },
            size: {
              height: 100,
              width: 100
            },
            data: {
              columns: mc_data,
              type : chart_type || 'bar',
              groups: grouped
              // onclick: function (d, i) { console.log("onclick", d, i); },
              // onmouseover: function (d, i) { console.log("onmouseover", d, i); }
              // onmouseout: function (d, i) { console.log("onmouseout", d, i); }
            },
            point: {
              r: 0
            },
            axis: {
              x: {
                show: false,
                tick: {
                  outer: false
                }
              },
              y: {
                show: checkFirst(idx),
                max: mc_max,
                tick: {
                  outer: false
                }
              }
            }
      };
      var chart = c3.generate(chart_dict, idx);
      chart.legend.hide();
    }

    d3.selectAll('.tick').each(function(d){
      // console.log('tick', d, this.textContent)
      if(d != 0 && d!= mc_max){
        d3.select(this).remove();
      }
    })

  });
})();
