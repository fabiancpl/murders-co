{

	//const parseDateTime = d3.timeParse( "%Y-%m-%d %H:%M:%S" );
	const parseDate = d3.timeParse( "%Y-%m-%d" );
	const monthNameFormat = d3.timeFormat( "%b-%Y" );

	const series = {
		'edad' : [ '18-29', '30-39', '40-50', '<18', '>50', 'NO REPORTADO', 'TOTAL' ],
		'genero' : [ 'FEMENINO', 'MASCULINO', 'NO REPORTA', 'TOTAL' ]
	};

	function drawTimeSeries( data, series_selected = series[ 'edad' ] ) {

		d3.select( ( '#timeseries' ) ).html( '' );

		var murders = series_selected.map( function( id ) {
		    return {
			    id: id,
		    	values: data.map( function( d ) {
		        return { 'FECHA': d[ 'FECHA' ], 'HOMICIDIOS': d[ id ] };
		    	} )
		    };
		 } );

		var svg = d3.select( '#timeseries' ),
			margin = { top: 50, right: 30, bottom: 70, left: 60 },
			iwidth = +svg.attr( "width" ) - margin.left - margin.right,
			iheight = +svg.attr( "height" ) - margin.top - margin.bottom;

		var g = svg.append( 'g' ).attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' );

		var x = d3.scaleTime()
			.range( [ 0, iwidth ] );

		var y = d3.scaleLinear()
			.range( [ iheight, 0 ] );

		var z = d3.scaleOrdinal( d3.schemeCategory10 );

		var line = d3.line()
			.curve( d3.curveBasis )
			.x( d => x( d[ 'FECHA' ] ) )
			.y( d => y( d[ 'HOMICIDIOS' ] ) );

		x.domain( d3.extent( data, function( d ) { return d[ 'FECHA' ]; } ) );

		y.domain([
			d3.min( murders, function(c) { return d3.min(c.values, function(d) { return d[ 'HOMICIDIOS' ]; }); }),
			d3.max( murders, function(c) { return d3.max(c.values, function(d) { return d[ 'HOMICIDIOS' ]; }); })
		]);

		z.domain(murders.map(function(c) { return c.id; }));

		function make_x_gridlines() {
			return d3.axisBottom( x );
		}

		function make_y_gridlines() {		
 			return d3.axisLeft( y );
		}

		g.append( "g" )			
			.attr( "class", "grid" )
			.attr( "transform", "translate(0," + iheight + ")" )
			.call( make_x_gridlines()
				.tickSize( -iheight )
				.tickFormat( "" )
			)

		g.append( "g" )			
			.attr( "class", "grid" )
			.call( make_y_gridlines()
				.tickSize( -iwidth )
				.tickFormat( "" )
			)

		var xAxis = g.append( 'g' )
			.attr( 'class', 'axis' )
			.attr( 'transform', 'translate(0,' + iheight + ')' )
			.call( d3.axisBottom( x ) );
		
		xAxis.selectAll( "text" )  
				.style( "text-anchor", "end" )
				.attr( "dx", "-.8em" )
				.attr( "dy", ".15em" )
				.attr( "transform", "rotate(-65)" );
		
		xAxis.append( 'text' )
				.attr( 'fill', '#000' )
				.attr( 'y', 20 )
				.attr( 'x', iwidth )
				.attr( 'dy', '1em' )
				.attr( 'text-anchor', 'end' )
				.text( 'Fecha' )
				.style( "font", "12px sans-serif" );

		g.append( 'g' )
			.attr( 'class', 'axis' )
			.call( d3.axisLeft( y ).ticks( null, ".1f" ) )
			.append( 'text' )
				.attr( 'fill', '#000' )
				.attr( 'transform', 'rotate(-90)' )
				.attr( 'y', -55 )
				.attr( 'dy', '1em' )
				.attr( 'text-anchor', 'end' )
				.text( '# Homicidios' )
				.style( "font", "12px sans-serif" );

		var murder = g.selectAll( ".murder" )
			.data( murders )
			.enter().append( "g" )
				.attr( "class", "murder" );

		murder.append( "path" )
			.attr( "class", "line" )
			.attr( "d", function( d ) { return line( d.values ); } )
			.style( "stroke", function( d ) { return z( d.id ); } );

		murder.append( "text" )
			.datum( function( d ) { return { id: d.id, value: d.values[ d.values.length - 1 ] }; } )
				.attr( "transform", function( d ) { return "translate(" + x( d.value[ 'FECHA' ] ) + "," + y( d.value[ 'HOMICIDIOS' ] ) + ")"; } )
				.attr( 'fill', function( d ) { return z( d.id ); } )
				.attr( 'dy', '1em' )
				.attr( 'text-anchor', 'end' )
				.style( "font", "10px sans-serif" )
				.text( function( d ) { return d.id; } );

		var mouseG = g.append( "g" )
			.attr("class", "mouse-over-effects");

		mouseG.append("path") // this is the black vertical line to follow mouse
			.attr("class", "mouse-line")
			.style("stroke", "black")
			.style("stroke-width", "1px")
			.style("opacity", "0");
      
    	var lines = document.getElementsByClassName('line');

		var mousePerLine = mouseG.selectAll('.mouse-per-line')
			.data(murders)
			.enter()
			.append("g")
			.attr("class", "mouse-per-line");

		mousePerLine.append("circle")
			.attr("r", 3)
			.style("stroke", function( d ) { return z( d.id ); })
			.style("fill", function( d ) { return z( d.id ); })
			.style("stroke-width", "1px")
			.style("opacity", "0");

		mousePerLine.append("text")
			.attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', iwidth) // can't catch mouse events on a g element
      .attr('height', iheight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + iheight;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            console.log(iwidth/mouse[0])
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d[ 'FECHA' ]; }).right;
                idx = bisect(d.values, xDate);
            
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }
            
            d3.select(this).select('text')
              .text(y.invert(pos.y).toFixed(2))
              .attr( 'fill', function( d ) { return z( d.id ); } )
				//.attr( 'dy', '1em' )
				//.attr( 'text-anchor', 'start' )
				.style( "font", "10px sans-serif" );
              
            return "translate(" + mouse[0] + "," + pos.y +")";
          });
      });

	}

	d3.csv( './data/murders_timeserie.csv', function ( d ) {
		d[ 'FECHA' ] = parseDate( d[ 'FECHA' ] );
		d[ 'TOTAL' ] = +d[ 'TOTAL' ];
		d[ '18-29' ] = +d[ '18-29' ];
		d[ '30-39' ] = +d[ '30-39' ];
		d[ '40-50' ] = +d[ '40-50' ];
		d[ '<18' ] = +d[ '<18' ];
		d[ '>50' ] = +d[ '>50' ];
		d[ 'NO REPORTADO' ] = +d[ 'NO REPORTADO' ];
		d[ 'FEMENINO' ] = +d[ 'FEMENINO' ];
		d[ 'MASCULINO' ] = +d[ 'MASCULINO' ];
		d[ 'NO REPORTA' ] = +d[ 'NO REPORTA' ];
		return d;
	} ).then( function( data ) {

		console.log( data );

		drawTimeSeries( data );

		d3.select( "#attrselection" ).on( "change", function() {
			attrselection = this.value;
			console.log( attrselection + " selected" );
			drawTimeSeries( data, series[ attrselection ] );
		} );

  } );

}