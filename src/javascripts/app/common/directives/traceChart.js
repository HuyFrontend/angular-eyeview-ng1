import angular from 'angular';
import * as d3 from  'd3';
import * as _ from  'lodash';
let module = angular.module('common.directives.traceChart', []);
module.directive('traceChart', ()=> {

    /**
     * link function
     * @param {Object} scope
     * @param {Object} elem
     * @param {Object} attrs
     */
    function linkFn(scope, elem, attrs) {
      var width = 760,
        height = 400 - 37,
        idx = 0, itv, dronDataHeight = 0;

      var droneText, gpsTable, attitudeTable, vehicleBatteryTable, vehicleVelocityTable;

      var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
      };

      // draw and append the container
      var svg = d3.select("#trace-chart").append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

      var textG = svg.append("g")
        .attr('class', 'drone-info')
        .attr('fill-opacity', '0.5');

      var xScale = d3.scaleLinear()
        .range([0, width - margin.left - margin.right]);

      var yScale = d3.scaleLinear()
        .range([height - margin.top - margin.bottom - dronDataHeight, 0]);

      var line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
          return xScale(d.x);
        })
        .y(function (d) {
          return yScale(d.y);
        });

      // create random data
      function newData(lineNumber, points) {
        return d3.range(lineNumber).map(function () {
          return d3.range(points).map(function (item, idx) {
            return {
              x: idx / (points - 1),
              y: Math.random() * 100
            };
          });
        });
      }

      function stopInterval() {
        if (itv) {
          clearInterval(itv);
        }
      }

      function renderGnu() {
        var data = scope.vm.gnuData.data[idx];
        if (!data) {
          stopInterval();
          return;
        }

        var nData = [data.data];

        // obtain absolute min and max
        var yMin = scope.vm.gnuData.minY;
        if (!angular.isDefined(yMin)) {
          yMin = _.min(nData[0], function (e) {
            return e.y;
          }).y;
        }

        var yMax = scope.vm.gnuData.maxY;
        if (!angular.isDefined(yMax)) {
          yMax = _.max(nData[0], function (e) {
            return e.y;
          }).y;
        }

        var xMin = scope.vm.gnuData.minX;
        if (!angular.isDefined(xMin)) {
          xMin = nData[0][0].x;
        }

        var xMax = scope.vm.gnuData.maxX;
        if (!angular.isDefined(xMax)) {
          xMax = nData[0][nData[0].length - 1].x;
        }

        if (isNaN(yMin) || isNaN(yMax) || isNaN(xMin) || isNaN(xMax)) {
          stopInterval();
          return;
        }

        // set domain for axis (start/end)
        yScale.domain([yMin, yMax]);
        xScale.domain([xMin, xMax]);

        // create axis scale
        var yAxis = d3.axisLeft(yScale);
        var xAxis = d3.axisBottom(xScale);

        // if no yaxis exists, create one, otherwise update it
        if (svg.selectAll(".y.axis")._groups[0].length < 1) {
          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        } else {
          svg.selectAll(".y.axis").call(yAxis);
        }

        // if no xaxis exists, create one, otherwise update it
        if (svg.selectAll(".x.axis")._groups[0].length < 1) {
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom - dronDataHeight) + ")")
            .call(xAxis);
        } else {
          svg.selectAll(".x.axis").call(xAxis);
        }

        // generate line paths
        var lines = svg.selectAll(".line").data(nData).attr("class", "line");

        // transition from previous paths to new paths
        lines
          .attr("d", line);

        // enter any new data
        lines.enter()
          .append("path")
          .attr("class", "line")
          .attr("d", line)
          .style("stroke", function () {
            // return '#' + Math.floor(Math.random() * 16777215).toString(16);
            return 'red';
          });

        // exit
        lines.exit()
          .remove();
      }

      function renderDrone() {
        var data = scope.vm.droneData.data[idx];
        // if (!data) {
        //   stopInterval();
        //   return;
        // }

        var nData = data;

        // Fake heading
        // nData.Vehicle.Heading = nData.Vehicle.Heading + idx * 10;

        function createGpsTable(dt) {
          var rows, gpsColumns = _.keys(dt.GpsInfo);
          if (!gpsTable) {
            var div = d3.select(".drone-info-tables")
              .append('div')
              .attr('class', 'drone-info');
            var header = div.append('div').attr('class', 'header').text('GPS Info');
            gpsTable = div
              .append('table')
              .attr('class', 'gps-info-table');
            var thead = gpsTable.append("thead");
            var tbody = gpsTable.append("tbody");


            // append the header row
            thead.append("tr")
              .selectAll("th")
              .data(gpsColumns)
              .enter()
              .append("th")
              .style('min-width', '50px')
              .style('font-size', '12px')
              .text(function (column) {
                return column;
              });

            // create a row for each object in the data
            rows = tbody.selectAll("tr")
              .data([dt.GpsInfo])
              .enter()
              .append("tr")
              .selectAll("td")
              .data(function (row) {
                return gpsColumns.map(function (column) {
                  return {column: column, value: row[column]};
                });
              })
              .enter()
              .append("td")
              .style('font-size', '12px')
              .html(function (d) {
                return d.value;
              });
          }
          else {
            rows = gpsTable.selectAll("tbody tr")
              .data([dt.GpsInfo]);

            rows.enter()
              .append('tr')
              .selectAll("td")
              .data(function (d) {
                return gpsColumns.map(function (column) {
                  return {column: column, value: d[column]};
                });
              })
              .enter()
              .append("td")
              .text(function (d) {
                return d;
              });

            rows.exit().remove();

            var cells = rows.selectAll('td')
              .data(function (d) {
                return gpsColumns.map(function (column) {
                  return {column: column, value: d[column]};
                });
              })
              .text(function (d) {
                return d.value;
              });

            // cells.enter()
            //   .append("td")
            //   .text(function (d) {
            //     debugger;
            //     return d.value;
            //   });

            cells.exit().remove();
          }
        }

        function createAttitudeTable(dt) {
          var rows, prop = "Attitude", columns = _.keys(_.get(dt, prop));
          if (!attitudeTable) {
            var div = d3.select(".drone-info-tables")
              .append('div')
              .attr('class', 'drone-info');
            var header = div.append('div').attr('class', 'header').text('Attitude');
            attitudeTable = div
              .append('table')
              .attr('class', prop.toLowerCase() + '-table');
            var thead = attitudeTable.append("thead");
            var tbody = attitudeTable.append("tbody");


            // append the header row
            thead.append("tr")
              .selectAll("th")
              .data(columns)
              .enter()
              .append("th")
              .style('min-width', '50px')
              .style('font-size', '12px')
              .text(function (column) {
                return column;
              });

            // create a row for each object in the data
            rows = tbody.selectAll("tr")
              .data([_.get(dt, prop)])
              .enter()
              .append("tr")
              .selectAll("td")
              .data(function (row) {
                return columns.map(function (column) {
                  return {column: column, value: row[column]};
                });
              })
              .enter()
              .append("td")
              .style('font-size', '12px')
              .html(function (d) {
                return d.value;
              });
          }
          else {
            rows = attitudeTable.selectAll("tbody tr")
              .data([_.get(dt, prop)]);

            rows.enter()
              .append('tr')
              .selectAll("td")
              .data(function (d) {
                return columns.map(function (column) {
                  return {column: column, value: d[column]};
                });
              })
              .enter()
              .append("td")
              .text(function (d) {
                return d;
              });

            rows.exit().remove();

            var cells = rows.selectAll('td')
              .data(function (d) {
                return columns.map(function (column) {
                  return {column: column, value: d[column]};
                });
              })
              .text(function (d) {
                return d.value;
              });

            // cells.enter()
            //   .append("td")
            //   .text(function (d) {
            //     debugger;
            //     return d.value;
            //   });

            cells.exit().remove();
          }
        }

        function createVehicleBatteryTable(dt) {
          var rows, prop = "Vehicle.Battery", columns = _.keys(_.get(dt, prop));
          if (!vehicleBatteryTable) {
            var div = d3.select(".drone-info-tables")
              .append('div')
              .attr('class', 'drone-info');
            var header = div.append('div').attr('class', 'header').text('Vehicle Battery');
            vehicleBatteryTable = div
              .append('table')
              .attr('class', prop.replace(/\./, '-').toLowerCase() + '-table');
            var thead = vehicleBatteryTable.append("thead");
            var tbody = vehicleBatteryTable.append("tbody");


            // append the header row
            thead.append("tr")
              .selectAll("th")
              .data(columns)
              .enter()
              .append("th")
              .style('min-width', '50px')
              .style('font-size', '12px')
              .text(function (column) {
                return column;
              });

            // create a row for each object in the data
            rows = tbody.selectAll("tr")
              .data([_.get(dt, prop)])
              .enter()
              .append("tr")
              .selectAll("td")
              .data(function (row) {
                return columns.map(function (column) {
                  return {column: column, value: row[column]};
                });
              })
              .enter()
              .append("td")
              .style('font-size', '12px')
              .html(function (d) {
                return d.value;
              });
          }
          else {
            rows = vehicleBatteryTable.selectAll("tbody tr")
              .data([_.get(dt, prop)]);

            rows.enter()
              .append('tr')
              .selectAll("td")
              .data(function (d) {
                return columns.map(function (column) {
                  return {column: column, value: d[column]};
                });
              })
              .enter()
              .append("td")
              .text(function (d) {
                return d;
              });

            rows.exit().remove();

            var cells = rows.selectAll('td')
              .data(function (d) {
                return columns.map(function (column) {
                  return {column: column, value: d[column]};
                });
              })
              .text(function (d) {
                return d.value;
              });

            // cells.enter()
            //   .append("td")
            //   .text(function (d) {
            //     debugger;
            //     return d.value;
            //   });

            cells.exit().remove();
          }
        }

        function createVehicleVelocityTable(dt) {
          var rows, prop = "Vehicle.Velocity", columns = _.keys(_.get(dt, prop));
          if (!vehicleVelocityTable) {
            var div = d3.select(".drone-info-tables")
              .append('div')
              .attr('class', 'drone-info');
            var header = div.append('div').attr('class', 'header').text('Vehicle Velocity');
            vehicleVelocityTable = div
              .append('table')
              .attr('class', prop.replace(/\./, '-').toLowerCase() + '-table');
            var thead = vehicleVelocityTable.append("thead");
            var tbody = vehicleVelocityTable.append("tbody");


            // append the header row
            thead.append("tr")
              .selectAll("th")
              .data(columns)
              .enter()
              .append("th")
              .style('min-width', '50px')
              .style('font-size', '12px')
              .text(function (column) {
                return column;
              });

            // create a row for each object in the data
            rows = tbody.selectAll("tr")
              .data([_.get(dt, prop)])
              .enter()
              .append("tr")
              .selectAll("td")
              .data(function (row) {
                return columns.map(function (column) {
                  return {column: column, value: row[column]};
                });
              })
              .enter()
              .append("td")
              .style('font-size', '12px')
              .html(function (d) {
                return d.value;
              });
          }
          else {
            rows = vehicleVelocityTable.selectAll("tbody tr")
              .data([_.get(dt, prop)]);

            rows.enter()
              .append('tr')
              .selectAll("td")
              .data(function (d) {
                return columns.map(function (column) {
                  return {column: column, value: d[column]};
                });
              })
              .enter()
              .append("td")
              .text(function (d) {
                return d;
              });

            rows.exit().remove();

            var cells = rows.selectAll('td')
              .data(function (d) {
                return columns.map(function (column) {
                  return {column: column, value: d[column]};
                });
              })
              .text(function (d) {
                return d.value;
              });

            // cells.enter()
            //   .append("td")
            //   .text(function (d) {
            //     debugger;
            //     return d.value;
            //   });

            cells.exit().remove();
          }
        }

        createGpsTable(nData);

        createAttitudeTable(nData);

        createVehicleBatteryTable(nData);

        createVehicleVelocityTable(nData);

        // Send drone data to map
        scope.vm.droneMap.updateDrone(nData);

        // DATA JOIN
        // Join new data with old elements, if any.
        // var droneData = textG.selectAll(".info")
        // .data([{
        //   label: 'Velocity',
        //   value: nData.Vehicle.Velocity.join(',')
        // }, {
        //   label: 'GPS',
        //   value: nData.Vehicle.Velocity.join(',')
        // }, {
        //   label: 'Battery',
        //   value: nData.Vehicle.Velocity.join(',')
        // }]);

        // ENTER
        // Create new elements as needed.
        //
        // ENTER + UPDATE
        // After merging the entered elements with the update selection,
        // apply operations to both.
        // var droneG = droneData
        //   .enter()
        //   .append("g");

        // droneText = droneG
        //   .append("text")
        //   .attr('class', 'info')
        //   .attr("x", 10)
        //   .attr("y", function (d, i) {
        //     return (i * 16) + height - dronDataHeight;
        //   })
        //   .style("font-size", "10px")
        //   .merge(droneData)
        //   .text(function (d) {
        //     return d.label + ': ' + d.value;
        //   });

        // EXIT
        // Remove old elements as needed.
        // droneText.exit().remove();

        // var drone = svg.append("g");
        // drone.append("text")
        //   // .attr("x", (width / 2))
        //   // .attr("y", 0 - (margin.top / 2))
        //   // .attr("text-anchor", "middle")
        //   .style("font-size", "11px")
        //   // .style("text-decoration", "underline")
        //   .text(function (d) {
        //     return d.label + ': ' + d.value;
        //   });
      }

      function render() {
        renderGnu();
        renderDrone();
        idx++;
      }

      // clear drone data from map
      scope.vm.droneMap.reset();

      // initial page render
      render();

      // continuous page render
      itv = setInterval(render, 100);
    }

    /**
     * Controller function
     * @param $scope
     */
    function CtrlFn($scope) {
      var vm = this;
      vm.droneMap = {};
    }

    return {
      restrict: 'E',
      template: "<div class='trace-chart-container row'><div class='col-md-6' id='trace-chart'></div><div class='col-md-6'><drone-map instance='vm.droneMap'></drone-map></div><div class='col-md-12 drone-info-tables'></div></div>",
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        gnuData: '=',
        droneData: '='
      },
      controller: [
        '$scope',
        CtrlFn
      ],
      link: linkFn
    };
  });
export default module;
